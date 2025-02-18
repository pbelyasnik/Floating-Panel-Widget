const PANEL_BUTTONS = {
  DRAG: {
    tag: 'div',
    className: 'drag-handle',
    text: '⋮⋮',
    title: 'Drag panel'
  },
  COLLAPSE: {
    tag: 'button',
    className: 'collapse-btn',
    states: {
      expanded: { text: '◀', title: 'Collapse panel' },
      collapsed: { text: '▶', title: 'Expand panel' }
    }
  },
  PRINT: {
    tag: 'button',
    className: 'print-btn',
    text: '🖨️',
    title: 'Print page'
  },
  COPY: {
    tag: 'button',
    className: 'copy-btn',
    states: {
      default: {
        html: '<svg width="22" height="22" style="margin: -2px -2px -6px -2px;" viewBox="0 0 24 24" role="presentation"><g fill="currentColor"><path d="M10 19h8V8h-8v11zM8 7.992C8 6.892 8.902 6 10.009 6h7.982C19.101 6 20 6.893 20 7.992v11.016c0 1.1-.902 1.992-2.009 1.992H10.01A2.001 2.001 0 018 19.008V7.992z"></path><path d="M5 16V4.992C5 3.892 5.902 3 7.009 3H15v13H5zm2 0h8V5H7v11z"></path></g></svg>',
        title: 'Copy URL'
      },
      copied: {
        html: '<span style="color: green; font-weight: bold; padding: 0px 3.5px;">✔</span>',
        title: 'URL copied to clipboard!'
      }
    }
  },
  SELECT: {
    tag: 'select',
    className: 'js-select'
  },
  CALL: {
    tag: 'button',
    className: 'call-btn',
    text: 'Call',
    title: 'Execute selected JavaScript'
  }
};

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

  createElement(config) {
    const states = config?.states || {};
    const stateDefault = Object.values(states)[0] || {};

    const className = stateDefault?.className || config?.className;
    const textContent = stateDefault?.text || config?.text;
    const htmlContent = stateDefault?.html || config?.html;
    const title = stateDefault?.title || config?.title;

    const element = document.createElement(config.tag);

    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    if (htmlContent) {
      element.innerHTML = htmlContent;
    }
    if (title) {
      element.title = title;
    }

    return element;
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'floating-panel';

    // Create drag handle
    this.panel.appendChild(this.createElement(PANEL_BUTTONS.DRAG));

    // Create collapse button
    this.panel.appendChild(this.createElement(PANEL_BUTTONS.COLLAPSE));

    // Create print button
    this.panel.appendChild(this.createElement(PANEL_BUTTONS.PRINT));

    // Create copy button
    this.panel.appendChild(this.createElement(PANEL_BUTTONS.COPY));

    // Create select element
    this.panel.appendChild(this.createElement(PANEL_BUTTONS.SELECT));

    // Create call button
    this.panel.appendChild(this.createElement(PANEL_BUTTONS.CALL));

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
      const collapseState = isCollapsed ? PANEL_BUTTONS.COLLAPSE.states.collapsed : PANEL_BUTTONS.COLLAPSE.states.expanded;
      collapseBtn.textContent = collapseState.text;
      collapseBtn.title = collapseState.title;

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

        // Perform copy button animation
        copyBtn.innerHTML = PANEL_BUTTONS.COPY.states.copied.html;
        copyBtn.title = PANEL_BUTTONS.COPY.states.copied.title;
        setTimeout(() => {
          copyBtn.innerHTML = PANEL_BUTTONS.COPY.states.default.html;
          copyBtn.title = PANEL_BUTTONS.COPY.states.default.title;
        }, 2000);
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
