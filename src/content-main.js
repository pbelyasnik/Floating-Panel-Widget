class FloatingPanel {
  constructor() {
    this.panel = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.bookmarks = [];
    this.selectedBookmarkIndex = 0; // Default selection
    
    this.init();
  }

  init() {
    this.loadSelectedBookmarkIndex();
    this.createPanel();
    this.setupEventListeners();
  }

  loadSelectedBookmarkIndex() {
    this.selectedBookmarkIndex = localStorage.getItem('selectedBookmarkIndex') || 0;
  }

  saveSelectedBookmarkIndex(index) {
    this.selectedBookmarkIndex = index;
    localStorage.setItem('selectedBookmarkIndex', index);
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'floating-panel';
    this.panel.innerHTML = `
      <div class="drag-handle">⋮⋮</div>
      <button class="collapse-btn" title="Hide/Show buttons">◀</button>
      <button class="print-btn" title="Print">🖨️</button>
      <button class="copy-btn" title="Copy URL">📋</button>
      <select class="js-select"></select>
      <button class="call-btn">Call</button>
    `;
    
    document.body.appendChild(this.panel);
  }

  setupEventListeners() {
    const dragHandle = this.panel.querySelector('.drag-handle');
    const collapseBtn = this.panel.querySelector('.collapse-btn');
    const printBtn = this.panel.querySelector('.print-btn');
    const copyBtn = this.panel.querySelector('.copy-btn');
    const callBtn = this.panel.querySelector('.call-btn');
    const select = this.panel.querySelector('.js-select');
    
    // Drag functionality
    dragHandle.addEventListener('mousedown', this.startDragging.bind(this));
    dragHandle.addEventListener('touchstart', this.startDragging.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('touchmove', this.drag.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
    document.addEventListener('touchend', this.stopDragging.bind(this));
    
    // Select change handler
    select.addEventListener('change', (e) => {
      this.saveSelectedBookmarkIndex(e.target.selectedIndex);
    });

    // Button actions
    collapseBtn.addEventListener('click', () => {
      this.panel.classList.toggle('collapsed');
      const isCollapsed = this.panel.classList.contains('collapsed');
      collapseBtn.textContent = isCollapsed ? '▶' : '◀';
      
      // Hide/show elements
      [printBtn, copyBtn, select, callBtn].forEach(el => {
        el.style.display = isCollapsed ? 'none' : '';
      });
    });
    
    printBtn.addEventListener('click', () => {
      window.print();
    });
    
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    });
    
    callBtn.addEventListener('click', () => {
      const selectedBookmark = this.bookmarks[this.selectedBookmarkIndex];
      if (selectedBookmark) {
        try {
          eval(selectedBookmark.code);
        } catch (err) {
          console.error('Failed to execute bookmark code:', err);
        }
      }
    });
    
    // Listen for bookmarks from isolated world
    window.addEventListener('message', (event) => {
      if (event.data.type === 'BOOKMARKS_LOADED') {
        this.bookmarks = event.data.bookmarks;
        this.updateBookmarkSelect();
      }
    });
  }

  updateBookmarkSelect() {
    const select = this.panel.querySelector('.js-select');
    select.innerHTML = 
      this.bookmarks.map((bookmark, index) => 
        `<option value="${index}">${bookmark.title}</option>`
      ).join('');

    // Set the previously selected index
    select.selectedIndex = this.selectedBookmarkIndex;
  }

  startDragging(e) {
    this.isDragging = true;
    
    if (e.type === 'mousedown') {
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    } else if (e.type === 'touchstart') {
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
    }
    
    const rect = this.panel.getBoundingClientRect();
    this.initialX = rect.left;
    this.initialY = rect.top;
    
    e.preventDefault();
  }

  drag(e) {
    if (!this.isDragging) return;
    
    let currentX, currentY;
    if (e.type === 'mousemove') {
      currentX = e.clientX;
      currentY = e.clientY;
    } else if (e.type === 'touchmove') {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    }
    
    const deltaX = currentX - this.dragStartX;
    const deltaY = currentY - this.dragStartY;
    
    const newX = this.initialX + deltaX;
    const newY = this.initialY + deltaY;
    
    this.panel.style.left = `${newX}px`;
    this.panel.style.top = `${newY}px`;
    this.panel.style.bottom = 'auto';
    
    e.preventDefault();
  }

  stopDragging() {
    this.isDragging = false;
  }
}

// Initialize the panel when the DOM is ready
(() => { new FloatingPanel(); })();
