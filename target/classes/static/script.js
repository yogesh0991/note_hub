const API_BASE_URL = '/items';   
const TAGS_API = '/tags';  
const DEFAULT_IMAGE = 'https://tse1.mm.bing.net/th/id/OIP.xPzKTaW3TqN98rYqcXI3VQHaE8?pid=Api&P=0&h=180';
 
let currentFilterTagId = null;  
let currentFilterTagName = 'All Tags';
let editingItemId = null; 

// DOM elements 
const itemsList = document.getElementById('itemsList');
const searchInput = document.getElementById('searchInput');
const tagFilterBtn = document.getElementById('tagFilterBtn');
const tagDropdown = document.getElementById('tagDropdown');
const addBtn = document.getElementById('addBtn');
const itemModal = document.getElementById('itemModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const itemForm = document.getElementById('itemForm');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const submitBtn = document.getElementById('submitBtn'); 
const tagSelectCustomWrapper = document.getElementById('tagSelectCustomWrapper');
const tagSelectDisplay = document.getElementById('tagSelectDisplay');
const tagSelectCustomList = document.getElementById('tagSelectCustomList');
const tagSelectedValue = document.getElementById('tagSelectedValue');
const tagSelectedNameInput = document.getElementById('tagSelectedName');
const customModal = document.getElementById('custom-alert-modal'); 
const alertMessageEl = document.getElementById('alert-message');
let alertTimeout; 
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');

// Variables to store the item ID 
let currentDeleteItemData = null; 
let confirmPromiseResolve = null; 

// --- a small pause ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const escapeHtml = (s = '') => {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
};

const debounce = (fn, wait = 300) => {
  let t; 
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};
 
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    let msg = text || res.statusText;
    try { msg = JSON.parse(text).message || JSON.stringify(JSON.parse(text)); } catch {}
    throw new Error(msg);
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function tagIdOf(tag) {
  if (!tag) return null;
 
  return tag.id ?? tag.tagId ?? null; 
}

function tagNameOf(tag) {
  if (!tag) return '';
  
  return tag.tagName ?? tag.name ?? ''; 
}
// my custom alert
function customAlert(message, duration = 3000) {
    clearTimeout(alertTimeout); 

    if (alertMessageEl) alertMessageEl.textContent = message;
    if (customModal) customModal.classList.remove('hidden');
    
    alertTimeout = setTimeout(closeCustomAlert, duration);
}

function closeCustomAlert() {
    if (customModal) customModal.classList.add('hidden');
}

//custom alert for delete
function customConfirm(message, data) {
    if (confirmMessage) confirmMessage.textContent = message;
    currentDeleteItemData = data; 
    confirmModal.classList.remove('hidden');
    
    return new Promise(resolve => {
        confirmPromiseResolve = resolve;
    });
}
function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    currentDeleteItemData = null;
}

function handleConfirmDelete() {
    if (confirmPromiseResolve) confirmPromiseResolve(true);
    closeConfirmModal();
}

function handleConfirmCancel() {
    if (confirmPromiseResolve) confirmPromiseResolve(false);
    closeConfirmModal();
}

// ---------- FILTER HELPERS ----------
function applyTagFilter(tagId, tagName) {
  currentFilterTagId = tagId;
  currentFilterTagName = tagName || 'All Tags';
  
  if (currentFilterTagName === 'All Tags' || !currentFilterTagName) {
    loadItems(); 
  } else {
    loadItemsByTagName(currentFilterTagName); 
  }
}

async function loadItemsByTagName(tagName) {
  if (!tagName) return loadItems();
  try {
    const items = await fetchJson(`${API_BASE_URL}/tag?name=${encodeURIComponent(tagName)}`); 
    // Sort items by ID descending when rendering filtered results
    const sortedItems = (items || []).sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    renderItems(sortedItems);
  } catch (err) {
    console.error('loadItemsByTagName', err.message);
  } 
}

function renderItems(items) {
  if (!itemsList) return;
  if (!items || items.length === 0) {
    itemsList.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No items found. Click the + button to add your first item!</p>';
    return;
  }

  const html = items.map(item => {
    const title = escapeHtml(item.title || 'Untitled');
    const desc = escapeHtml(item.description || '');
    const tagName = escapeHtml(tagNameOf(item.tag) || '');
    const tagId = tagIdOf(item.tag) ?? '';
    const image = escapeHtml(item.imageUrl || item.image || DEFAULT_IMAGE);
    const link = escapeHtml(item.linkUrl || item.link || '');
    const visitBtn = link ? `<a href="${link}" target="_blank" class="btn-visit"><i class='fas fa-external-link-alt'></i> Visit</a>` : '';

    return `
      <div class="item-card" data-id="${item.id}" data-tag-id="${tagId}" data-tag-name="${tagName}">
        <img src="${image}" alt="${title}" class="item-image" onerror="this.src='${DEFAULT_IMAGE}'">
        <div class="item-content">
          <div class="item-header">
            <h3 class="item-title">${title}</h3>
            <span class="item-tag" style="cursor:pointer" data-tag-id="${tagId}" title="Click to filter by this tag">${tagName}</span>
          </div>
          <p class="item-description">${desc}</p>
          <div class="item-actions-bottom">
            ${visitBtn}
            <div class="secondary-actions"> 
                <button class="btn-edit" data-id="${item.id}"><i class="fas fa-pencil-alt"></i> Update</button>
                <button class="btn-delete" data-id="${item.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  itemsList.innerHTML = html;
}

// Populate the custom tag dropdown list
function populateCustomTagSelect(tags){
  if (!tagSelectCustomList || !tagSelectedNameInput || !tagSelectedValue) return;
  tagSelectCustomList.innerHTML = '';
  
  // Add the placeholder option
  const placeholderEl = document.createElement('div');
  placeholderEl.className = 'tag-option custom-option';
  placeholderEl.setAttribute('data-tag-name', '');
  placeholderEl.textContent = '-- Select Tag --';
  tagSelectCustomList.appendChild(placeholderEl);

  (tags || []).forEach(t => {
    const name = tagNameOf(t) || (typeof t === 'string' ? t : '');
    if (!name) return; 
    
    const el = document.createElement('div');
    el.className = 'tag-option custom-option';
    el.setAttribute('data-tag-name', name);
    el.textContent = name;
    tagSelectCustomList.appendChild(el);
  });
  
  // Attach event listeners to the new options
  tagSelectCustomList.querySelectorAll('.custom-option').forEach(opt => {
      opt.onclick = () => {
          const name = opt.getAttribute('data-tag-name') || '';
          
          tagSelectedNameInput.value = name;
          tagSelectedValue.textContent = name || '-- Select Tag --';
          tagSelectCustomList.classList.add('hidden');
      };
  });
}

function updateTagDropdown(tags) {
  if (!tagDropdown) return;
  tagDropdown.innerHTML = '';
  
  const all = document.createElement('div');
  all.className = 'tag-option';
  all.setAttribute('data-tag-id', '');
  all.setAttribute('data-tag-name', 'All Tags');
  all.textContent = 'All Tags';
  tagDropdown.appendChild(all);

  (tags || []).forEach(t => {
    const id = tagIdOf(t);
    const name = tagNameOf(t);
    if (!name) return;
    const el = document.createElement('div');
    el.className = 'tag-option';
    el.setAttribute('data-tag-id', id ?? '');
    el.setAttribute('data-tag-name', name);
    el.textContent = name;
    tagDropdown.appendChild(el);
  });

  tagDropdown.querySelectorAll('.tag-option').forEach(opt => {
    opt.onclick = (e) => {
      e.stopPropagation();
      const name = opt.getAttribute('data-tag-name') || 'All Tags';
      const id = opt.getAttribute('data-tag-id') || null;
      
      applyTagFilter(id ? Number(id) : null, name);
      
      tagDropdown.classList.add('hidden');
      if (tagFilterBtn && tagFilterBtn.querySelector('span')) {
        tagFilterBtn.querySelector('span').textContent = name;
      }
    };
  });
}

async function loadItems() {
  try {
    const items = await fetchJson(API_BASE_URL);
    const sortedItems = (items || []).sort((a, b) => {
        // for safety and sort ID descending (b - a)
        const idA = a.id ?? 0; 
        const idB = b.id ?? 0;
        return idB - idA; 
    });
    
    renderItems(sortedItems);

    const tagsFromItems = [...new Set((items || []).map(it => tagNameOf(it.tag)).filter(Boolean))];
    if (tagsFromItems.length) mergeTagNamesIntoDropdown(tagsFromItems);
    //the array length for the caller
    return sortedItems.length;
  } catch (err) {
    console.error('loadItems', err.message);
    if (itemsList) itemsList.innerHTML = '<div class="no-items">Error loading items. Start the backend and refresh.</div>';
    throw err; 
  }
}

async function loadTags() {
  try {
    const tags = await fetchJson(TAGS_API);
    // Populate the custom dropdown
    populateCustomTagSelect(tags || []);
    // ---------------------------------
    updateTagDropdown(tags || []);
  } catch (err) {
    console.warn('loadTags:', err.message);
    //Call the new function
    populateCustomTagSelect([]);
    updateTagDropdown([]);
  }
}
function mergeTagNamesIntoDropdown(tagNames) {
  if (!tagDropdown) return;
  const existing = Array.from(tagDropdown.querySelectorAll('.tag-option')).map(n => n.getAttribute('data-tag-name'));
  tagNames.forEach(name => {
    if (!existing.includes(name)) {
      const el = document.createElement('div');
      el.className = 'tag-option';
      el.setAttribute('data-tag-id', '');
      el.setAttribute('data-tag-name', name);
      el.textContent = name;
      tagDropdown.appendChild(el);
      el.onclick = (e) => {
        e.stopPropagation();
        applyTagFilter(null, name); 
        tagDropdown.classList.add('hidden');
      };
    }
  });
}
// form handling
function openModal(item = null) {
  editingItemId = item ? item.id : null;
  modalTitle.textContent = item ? 'Edit Item' : 'Add New Item';
  modalDescription.textContent = item ? 'Edit the item details below.' : 'Add a new item to your collection. Fill in the details below.';
  submitBtn.textContent = item ? 'Update Item' : 'Add Item';

  
  if (item) {
    document.getElementById('itemId').value = item.id ?? '';
    document.getElementById('itemTitle').value = item.title ?? '';
    document.getElementById('itemDescription').value = item.description ?? '';
    
// Set the value for the custom dropdown 
    const tagName = tagNameOf(item.tag) || '';
    tagSelectedNameInput.value = tagName;
    tagSelectedValue.textContent = tagName || '-- Select Tag --';
    // ----------------------------------------------------
    
    document.getElementById('itemImageUrl').value = item.imageUrl || item.image || '';
    document.getElementById('itemLinkUrl').value = item.linkUrl || item.link || '';
  } else {
    itemForm.reset();
    document.getElementById('itemId').value = '';
    // Reset custom dropdown placeholder
    tagSelectedNameInput.value = '';
    tagSelectedValue.textContent = '-- Select Tag --';
  }

  itemModal.classList.remove('hidden');
}

function closeModal() {
  itemModal.classList.add('hidden');
  itemForm.reset();
  editingItemId = null;
  // Reset custom dropdown placeholder 
  tagSelectedNameInput.value = '';
  tagSelectedValue.textContent = '-- Select Tag --';
}

// ---------- Form submit (create/update) ----------
async function handleFormSubmit(e) {
  e.preventDefault();

  const isUpdating = !!editingItemId;
  
  const title = (document.getElementById('itemTitle').value || '').trim();
  const description = (document.getElementById('itemDescription').value || '').trim();
  //Get value from the HIDDEN INPUT 
  const tagName = (tagSelectedNameInput.value || '').trim();
  
  const imageUrl = (document.getElementById('itemImageUrl').value || '').trim() || DEFAULT_IMAGE; 
  const linkUrl = (document.getElementById('itemLinkUrl').value || '').trim() || null; 

  if (!title) { customAlert('Title is required'); return; }
  if (!description) { customAlert('Description is required'); return; }
  // Check for tag name 
  if (!tagName) { customAlert('Please select a tag'); return; }
  
  const payload = {
    title,
    description,
    imageUrl,
    linkUrl,
    tag: { 
        tagName: tagName 
    }
  };

  try {
    const url = isUpdating ? `${API_BASE_URL}/${editingItemId}` : API_BASE_URL;
    const method = isUpdating ? 'PUT' : 'POST';
    
    await fetchJson(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    closeModal();
    // loadItems() will now fetch the list and sort it, placing the newest item on top.
    await loadItems();
    await loadTags();
    
    if (!isUpdating) {
        customAlert(`Item "${title}" added successfully!`);
        console.log('Item created');
    } else {
        customAlert(`Item "${title}" updated successfully!`);
        console.log('Item updated');
    }

  } catch (err) {
    console.error('save item:', err.message); 
    customAlert('Failed to save item Title already exist'); 
  }
} 

// ---------- Edit / Delete / Tag click handling via delegation ----------
function bindListDelegation() {
  if (!itemsList) return;
  itemsList.addEventListener('click', async (ev) => {
    const editBtn = ev.target.closest('.btn-edit');
    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      if (!id) return;
      try {
        const item = await fetchJson(`${API_BASE_URL}/${id}`);
        openModal(item);
      } catch (err) {
        console.error('load item:', err.message);
        customAlert('Failed to load item');
      }
      return;
    }
	
    const delBtn = ev.target.closest('.btn-delete');
    if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      if (!id) return;
      
      const confirmed = await customConfirm('Are you sure you want to delete this item?', id);

      if (confirmed) {
        try {
            await fetchJson(`${API_BASE_URL}/${id}`, { method: 'DELETE' }); 
            //Add a small delay (e.g., 50ms) to ensure database commit ---
            await sleep(50);        
            await loadItems();
            await loadTags();        
            customAlert('Item deleted successfully!'); 
            console.log('deleted');
        } catch (err) {
            console.error('delete:', err.message);
            customAlert('Failed to delete item');
        }
      }
      return;
    }

    const tagEl = ev.target.closest('.item-tag');
    if (tagEl) {
      const tagId = tagEl.getAttribute('data-tag-id');
      const tagName = tagEl.textContent.trim();
      applyTagFilter(tagId ? Number(tagId) : null, tagName);
      
      if (tagFilterBtn && tagFilterBtn.querySelector('span')) {
        tagFilterBtn.querySelector('span').textContent = tagName;
        tagDropdown.classList.add('hidden'); 
      }
      return;
    }
  }); 
}
// Toggle the custom dropdown list 
function toggleCustomDropdown() {
    if (tagSelectCustomList) {
        tagSelectCustomList.classList.toggle('hidden'); 
    }
}
// ---------- Search ----------
async function handleSearch() {
  const keyword = (searchInput.value || '').trim();
  if (!keyword) {
    applyTagFilter(currentFilterTagId, currentFilterTagName);
    return;
  } 
  try { 
    const items = await fetchJson(`${API_BASE_URL}/search?match=${encodeURIComponent(keyword)}`);
    // Sort items by ID descending when rendering search results
    const sortedItems = (items || []).sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    renderItems(sortedItems);
	
  } catch (err) {
    console.error('search:', err.message); 
    customAlert('Search failed: ' + err.message);
  } 
} 

(function init() {
  // UI event bindings
  addBtn && addBtn.addEventListener('click', () => openModal());
  closeModalBtn && closeModalBtn.addEventListener('click', closeModal);
  cancelBtn && cancelBtn.addEventListener('click', closeModal);
  
  //Bind click handler to the custom display button 
  tagSelectDisplay && tagSelectDisplay.addEventListener('click', toggleCustomDropdown);
  
  // Bind handlers for the new Confirmation Modal
  confirmDeleteBtn && confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  confirmCancelBtn && confirmCancelBtn.addEventListener('click', handleConfirmCancel);

  // Close modals when clicking outside
  if (itemModal) itemModal.addEventListener('click', (e) => { 
      if (e.target === itemModal) closeModal(); 
  });
  
  // Close custom dropdown when clicking outside the wrapper 
  document.addEventListener('click', (e) => {
      // Check if the click is outside the custom wrapper
      if (tagSelectCustomWrapper && !tagSelectCustomWrapper.contains(e.target)) {
          if (tagSelectCustomList && !tagSelectCustomList.classList.contains('hidden')) {
              tagSelectCustomList.classList.add('hidden');
          }
      }
  });
  
  // Custom Alert close listeners (click and keydown)
  if (customModal) customModal.addEventListener('click', (e) => { 
      if (e.target.closest('.custom-alert-box')) {
          closeCustomAlert(); 
      }
  });
  
  // Close confirmation modal when clicking outside
  if (confirmModal) confirmModal.addEventListener('click', (e) => { 
      if (e.target === confirmModal) handleConfirmCancel(); 
  });
  
  document.addEventListener('keydown', (e) => {
    if (customModal && !customModal.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        closeCustomAlert();
      }
    }

    if (confirmModal && !confirmModal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
            handleConfirmCancel();
        }  
    }
  });
 
  if (itemForm) itemForm.addEventListener('submit', handleFormSubmit);
  if (searchInput) searchInput.addEventListener('input', debounce(handleSearch, 300));
  if (tagFilterBtn) tagFilterBtn.addEventListener('click', () => tagDropdown && tagDropdown.classList.toggle('hidden'));

  // Bind delegation for dynamic elements (edit/delete/tag clicks)
  bindListDelegation(); 
  // Load tags first, as they are needed for the dropdowns
  loadTags(); 
   
  // Use the returned length to show the correct alert 
  loadItems()
    .then((itemCount) => { 
      if (itemCount === 0) {
          // Display alert for no items found (longer duration)
          customAlert("Your collection is currently empty. Start adding items with the '+' button!", 6000); 
      } else {
          // Display success alert with item count
          customAlert(`Welcome to your collection! ${itemCount} items loaded successfully.`, 3000);
      }
    })
    .catch(err => {
      // Catch any error thrown by loadItems (e.g., API is down) to prevent .then() from running
      console.log("Welcome alert suppressed due to load error.");
    });
  
})();