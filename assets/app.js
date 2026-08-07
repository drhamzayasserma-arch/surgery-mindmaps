/* ============================================
   Surgery Mind Maps — Shared Utilities
   ============================================ */

// ---------- Category Icon Map ----------
const CATEGORY_ICONS = {
  liver: '🩸',
  gallbladder: '💚',
  pancreas: '💛',
  stomach: '🍽️',
  small_intestine: '🌀',
  colon_rectum: '🟤',
  appendix: '⚠️',
  hernia: '🔷',
  breast: '🩷',
  vascular: '❤️',
  urology: '💧',
  thyroid_parathyroid: '🦋',
  esophagus: '🔽',
  spleen: '🟣',
  trauma_emergency: '🚨',
};

// Default icon for dynamically added categories
const DEFAULT_ICON = '🏥';

// ---------- URL Utilities ----------

/**
 * Get a URL query parameter value.
 */
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Convert a display name into a URL-safe slug.
 * "Anatomy & Physiology" → "anatomy_physiology"
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[&]+/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/**
 * Convert a slug back into a display name.
 * "anatomy_physiology" → "Anatomy Physiology"
 */
function unslugify(slug) {
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ---------- Data Loading (localStorage + JSON fallback) ----------

/**
 * Load categories list.
 * Priority: localStorage → data/categories.json
 */
async function loadCategories() {
  let localData = [];
  const stored = localStorage.getItem('surgery_maps_categories');
  if (stored) {
    try {
      localData = JSON.parse(stored);
    } catch (e) {}
  }
  
  try {
    const resp = await fetch('data/categories.json', { cache: 'no-cache' });
    if (resp.ok) {
      const data = await resp.json();
      const serverData = data.categories;
      const merged = [...serverData];
      const serverIds = new Set(serverData.map(c => c.id));
      for (const lc of localData) {
        if (!serverIds.has(lc.id)) merged.push(lc);
      }
      localStorage.setItem('surgery_maps_categories', JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn('Could not load categories.json:', e);
  }
  return localData;
}

/**
 * Save categories list to localStorage.
 */
function saveCategoriesToLocal(categories) {
  localStorage.setItem('surgery_maps_categories', JSON.stringify(categories));
}

/**
 * Load topics for a given category.
 * Priority: localStorage → data/{catId}/topics.json
 */
async function loadTopics(catId) {
  const storageKey = `surgery_maps_topics_${catId}`;
  let localTopics = [];
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      localTopics = JSON.parse(stored);
    } catch (e) {}
  }
  
  try {
    const resp = await fetch(`data/${catId}/topics.json`, { cache: 'no-cache' });
    if (resp.ok) {
      const data = await resp.json();
      const serverTopics = data.topics;
      const merged = [...serverTopics];
      const serverIds = new Set(serverTopics.map(t => t.id));
      for (const lt of localTopics) {
        if (!serverIds.has(lt.id)) merged.push(lt);
      }
      localStorage.setItem(storageKey, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn(`Could not load topics for ${catId}:`, e);
  }
  return localTopics;
}

/**
 * Save topics for a category to localStorage.
 */
function saveTopicsToLocal(catId, topics) {
  const storageKey = `surgery_maps_topics_${catId}`;
  localStorage.setItem(storageKey, JSON.stringify(topics));
}

// ---------- Mind Map Data ----------

/**
 * Load mind map data for a given path.
 * Priority: localStorage → data/{path}.json → default template
 * @param {string} mapPath - e.g. "liver/anatomy_physiology"
 * @param {string} topicName - display name for default template
 */
async function loadMindMapData(mapPath, topicName) {
  const storageKey = `surgery_maps_mindmap_${mapPath}`;

  // Try localStorage
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return { data: JSON.parse(stored), source: 'local' };
    } catch (e) {
      console.warn('Invalid localStorage mind map, falling back');
    }
  }

  // Try JSON file
  try {
    const resp = await fetch(`data/${mapPath}.json`);
    if (resp.ok) {
      const data = await resp.json();
      return { data, source: 'file' };
    }
  } catch (e) {
    console.warn(`Could not load mind map from data/${mapPath}.json:`, e);
  }

  // Default template
  return { data: getDefaultMindMapData(topicName || unslugify(mapPath.split('/').pop())), source: 'default' };
}

/**
 * Save mind map data to localStorage.
 */
function saveMindMapToLocal(mapPath, data) {
  const storageKey = `surgery_maps_mindmap_${mapPath}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

/**
 * Clear mind map data from localStorage.
 */
function clearMindMapLocal(mapPath) {
  const storageKey = `surgery_maps_mindmap_${mapPath}`;
  localStorage.removeItem(storageKey);
}

/**
 * Check if there's local mind map data.
 */
function hasMindMapLocal(mapPath) {
  const storageKey = `surgery_maps_mindmap_${mapPath}`;
  return localStorage.getItem(storageKey) !== null;
}

/**
 * Get a default empty mind map in mind-elixir format.
 */
function getDefaultMindMapData(topicName) {
  return {
    nodeData: {
      id: 'root',
      topic: topicName || 'New Mind Map',
      root: true,
      children: [
        {
          topic: 'Key Point 1',
          id: generateId(),
          direction: 0,
          children: []
        },
        {
          topic: 'Key Point 2',
          id: generateId(),
          direction: 1,
          children: []
        }
      ]
    }
  };
}

/**
 * Generate a simple unique ID for mind map nodes.
 */
function generateId() {
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- UI Components ----------

/**
 * Render breadcrumb navigation.
 * @param {HTMLElement} container
 * @param {Array<{label: string, href?: string}>} items
 */
function renderBreadcrumbs(container, items) {
  container.innerHTML = '';
  container.className = 'breadcrumb';

  items.forEach((item, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb__separator';
      sep.textContent = '›';
      container.appendChild(sep);
    }

    if (item.href && i < items.length - 1) {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      container.appendChild(link);
    } else {
      const span = document.createElement('span');
      span.className = 'breadcrumb__current';
      span.textContent = item.label;
      container.appendChild(span);
    }
  });
}

/**
 * Show a modal dialog with a text input.
 * @param {Object} options - { title, placeholder, onSubmit }
 */
function showModal({ title, placeholder, onSubmit }) {
  // Remove any existing modal
  hideModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__title">${title}</div>
      <input
        type="text"
        class="modal__input"
        id="modal-input"
        placeholder="${placeholder || 'Enter name...'}"
        autocomplete="off"
        spellcheck="false"
      />
      <div class="modal__actions">
        <button class="btn btn--ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn--primary" id="modal-submit">Add</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById('modal-input');
  const submitBtn = document.getElementById('modal-submit');
  const cancelBtn = document.getElementById('modal-cancel');

  // Focus input after animation
  setTimeout(() => input.focus(), 100);

  function submit() {
    const value = input.value.trim();
    if (value) {
      onSubmit(value);
      hideModal();
    } else {
      input.style.borderColor = '#f87171';
      input.setAttribute('placeholder', 'Please enter a name');
      setTimeout(() => {
        input.style.borderColor = '';
        input.setAttribute('placeholder', placeholder || 'Enter name...');
      }, 1500);
    }
  }

  submitBtn.addEventListener('click', submit);
  cancelBtn.addEventListener('click', hideModal);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') hideModal();
  });

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });
}

/**
 * Hide/remove the modal.
 */
function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.remove();
}

/**
 * Show a toast notification.
 */
function showToast(message, duration = 2500) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Get the icon for a category.
 */
function getCategoryIcon(catId) {
  return CATEGORY_ICONS[catId] || DEFAULT_ICON;
}

/**
 * Find a category object by ID from a list.
 */
function findCategory(categories, catId) {
  return categories.find(c => c.id === catId);
}

/**
 * Check if an MCQ file exists for a given category and topic.
 * @param {string} catId - e.g. "liver"
 * @param {string} topicId - e.g. "anatomy_physiology"
 * @returns {Promise<boolean>}
 */
async function checkMcqExists(catId, topicId) {
  // Check localStorage first
  const storageKey = `surgery_maps_mcq_${catId}_${topicId}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.questions && parsed.questions.length > 0) return true;
    } catch(e) {}
  }

  // Check JSON file
  try {
    const resp = await fetch(`data/${catId}/mcqs_${topicId}.json`, { method: 'HEAD' });
    return resp.ok;
  } catch(e) {
    return false;
  }
}
