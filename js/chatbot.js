class ChatBot {
  constructor() {
    this.chatIcon = document.getElementById('chat-icon');
    this.chatWindow = document.getElementById('chat-window');
    this.closeBtn = document.getElementById('chat-close');
    this.messageInput = document.getElementById('message-input');
    this.sendBtn = document.getElementById('send-button');
    this.chatMessages = document.getElementById('chat-messages');
    
    // Track if this is the first API request
    this.isFirstRequest = true;
    
    this.initEventListeners();
    this.addWelcomeMessage();
    this.initResizableWindow();
    this.initDraggableWindow(); // Add draggable functionality
    
    // Only auto-open on index page
    const isIndexPage = this.isIndexPage();
    if (isIndexPage) {
      setTimeout(() => this.openChatWindow(), 1000);
    }
  }
  
  isIndexPage() {
    // Check if this is the index/home page
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page === '' || page === 'index.html' || path.endsWith('/');
  }
  
  initEventListeners() {
    // Toggle chat window when icon is clicked
    this.chatIcon.addEventListener('click', () => {
      this.toggleChatWindow();
    });
    
    // Close chat window when close button is clicked
    this.closeBtn.addEventListener('click', () => {
      this.closeChatWindow();
    });
    
    // Send message when send button is clicked
    this.sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Convert input field to textarea for multi-line support
    this.convertInputToTextarea();
    
    // Send message when Enter key is pressed (only if Shift key is not pressed)
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent default newline
        this.sendMessage();
      }
    });
    
    // Handle input resize as user types
    this.messageInput.addEventListener('input', () => {
      this.autoResizeInput();
    });
  }
  
  initResizableWindow() {
    // Make chat window resizable
    this.chatWindow.style.resize = 'both';
    this.chatWindow.style.overflow = 'hidden';
    this.chatWindow.style.minWidth = '300px';
    this.chatWindow.style.minHeight = '400px';
    this.chatWindow.style.maxWidth = '800px';
    this.chatWindow.style.maxHeight = '90vh';
    
    // Add resize handle visual indicator
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.width = '15px';
    resizeHandle.style.height = '15px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.backgroundImage = 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, #ccc 50%, #ccc 100%)';
    this.chatWindow.appendChild(resizeHandle);
    
    // Adjust messages container when window is resized
    const observer = new ResizeObserver(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    });
    observer.observe(this.chatWindow);
    
    // Disable resize on mobile devices
    if (window.innerWidth <= 768) {
      this.chatWindow.style.resize = 'none';
      resizeHandle.style.display = 'none';
    }
    
    // Re-check on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        this.chatWindow.style.resize = 'none';
        resizeHandle.style.display = 'none';
      } else {
        this.chatWindow.style.resize = 'both';
        resizeHandle.style.display = 'block';
      }
    });
  }
  
  initDraggableWindow() {
    const chatHeader = document.querySelector('.chat-header');
    let isDragging = false;
    let offsetX, offsetY;
    
    // Function to start dragging
    const startDrag = (e) => {
      // Only enable dragging on desktop
      if (window.innerWidth <= 768) return;
      
      // Prevent if resizing
      if (e.target === document.querySelector('.resize-handle')) return;
      
      isDragging = true;
      
      // Get current window position
      const rect = this.chatWindow.getBoundingClientRect();
      
      // If using touch events
      if (e.type === 'touchstart') {
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
      } else {
        // For mouse events
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
      }
      
      // Change cursor to indicate dragging
      this.chatWindow.style.cursor = 'grabbing';
      
      // Prevent text selection during drag
      e.preventDefault();
    };
    
    // Function to handle dragging
    const drag = (e) => {
      if (!isDragging) return;
      
      let clientX, clientY;
      
      // If using touch events
      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        // For mouse events
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Calculate new position
      let left = clientX - offsetX;
      let top = clientY - offsetY;
      
      // Keep window within viewport bounds
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const chatWidth = this.chatWindow.offsetWidth;
      const chatHeight = this.chatWindow.offsetHeight;
      
      // Prevent moving out of viewport
      left = Math.max(0, Math.min(left, windowWidth - chatWidth));
      top = Math.max(0, Math.min(top, windowHeight - chatHeight));
      
      // Set new position
      this.chatWindow.style.left = `${left}px`;
      this.chatWindow.style.top = `${top}px`;
      this.chatWindow.style.right = 'auto';
      this.chatWindow.style.bottom = 'auto';
      
      // Set position to absolute for dragging
      this.chatWindow.style.position = 'fixed';
    };
    
    // Function to stop dragging
    const stopDrag = () => {
      if (!isDragging) return;
      
      isDragging = false;
      
      // Reset cursor
      this.chatWindow.style.cursor = 'auto';
    };
    
    // Add event listeners for mouse events
    chatHeader.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    // Add event listeners for touch events (mobile)
    chatHeader.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDrag);
    
    // Reset position when window is resized
    window.addEventListener('resize', () => {
      // Disable dragging on mobile
      if (window.innerWidth <= 768) {
        this.chatWindow.style.position = 'fixed';
        this.chatWindow.style.left = 'auto';
        this.chatWindow.style.top = 'auto';
        this.chatWindow.style.right = '20px';
        this.chatWindow.style.bottom = '90px';
        
        // Full screen for very small devices
        if (window.innerWidth <= 360) {
          this.chatWindow.style.width = '100%';
          this.chatWindow.style.height = '85vh';
          this.chatWindow.style.right = '0';
          this.chatWindow.style.bottom = '0';
        } else if (window.innerWidth <= 480) {
          this.chatWindow.style.width = '90%';
          this.chatWindow.style.height = '60vh';
          this.chatWindow.style.right = '5%';
        }
      }
    });
  }
  
  openChatWindow() {
    this.chatWindow.classList.remove('hidden');
    this.chatIcon.classList.add('hidden');
    this.messageInput.focus();
    
    // Reset position when opening (to handle cases when screen size changed while closed)
    if (window.innerWidth > 768) {
      // Desktop default position if not previously positioned
      if (!this.chatWindow.style.left && !this.chatWindow.style.top) {
        this.chatWindow.style.right = '20px';
        this.chatWindow.style.bottom = '90px';
        this.chatWindow.style.left = 'auto';
        this.chatWindow.style.top = 'auto';
      }
    } else {
      // For mobile, ensure the chat window fits properly
      if (window.innerWidth <= 480) {
        this.chatWindow.style.width = '90%';
        this.chatWindow.style.height = '60vh';
        this.chatWindow.style.right = '5%';
        
        // Full screen for very small devices
        if (window.innerWidth <= 360) {
          this.chatWindow.style.width = '100%';
          this.chatWindow.style.height = '85vh'; // Not 100vh to avoid keyboard issues
          this.chatWindow.style.bottom = '0';
          this.chatWindow.style.right = '0';
          this.chatWindow.style.borderRadius = '0';
          document.querySelector('.chat-header').style.borderRadius = '0';
        }
      }
    }
    
    // Reset textarea height when opening chat
    setTimeout(() => {
      if (this.messageInput.tagName.toLowerCase() === 'textarea') {
        this.autoResizeInput();
      }
    }, 100);
  }
  
  toggleChatWindow() {
    if (this.chatWindow.classList.contains('hidden')) {
      this.openChatWindow();
    } else {
      this.closeChatWindow();
    }
  }
  
  closeChatWindow() {
    this.chatWindow.classList.add('hidden');
    this.chatIcon.classList.remove('hidden');
  }
  
  addWelcomeMessage() {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'message bot-message';
    welcomeMsg.innerHTML = `
      <div class="message-content">
      <p>👋 Hi there! I'm Swayam's assistant. How can I help you today?</p>
      <small class="disclaimer">Disclaimer: The responses provided by this chatbot may not always be accurate.</small>
      </div>
    `;
    this.chatMessages.appendChild(welcomeMsg);
  }
  
  addUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'message user-message';
    message.innerHTML = `
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
    this.chatMessages.appendChild(message);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  // Parse markdown to HTML
  parseMarkdown(text) {
    if (!text) return '';
    
    // Convert code blocks
    text = text.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert headers
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Convert bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Convert unordered lists
    text = text.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Convert ordered lists
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.+<\/li>\n)+/g, '<ol>$&</ol>');
    
    // Convert paragraphs (lines with line breaks)
    text = text.replace(/^(.+)$/gm, '<p>$1</p>');
    
    return text;
  }
  
  addBotMessage(text) {
    const message = document.createElement('div');
    message.className = 'message bot-message';
    // Use the markdown parser for bot messages
    message.innerHTML = `
      <div class="message-content">
        ${this.parseMarkdown(text)}
      </div>
    `;
    this.chatMessages.appendChild(message);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  addTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'message bot-message typing-indicator';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="message-content">
        <div class="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    this.chatMessages.appendChild(typing);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    this.addUserMessage(message);
    this.messageInput.value = '';
    
    // Show typing indicator
    this.addTypingIndicator();
    
    // Show server restart notice if this is the first request
    if (this.isFirstRequest) {
      this.addServerRestartNotice();
    }
    
    try {
      const response = await this.sendToAPI(message);
      this.removeTypingIndicator();
      this.addBotMessage(response);
      
      // Set isFirstRequest to false after the first successful response
      this.isFirstRequest = false;
    } catch (error) {
      this.removeTypingIndicator();
      this.addBotMessage("Sorry, I'm having trouble connecting to the server. Please try again later.");
      console.error('Error:', error);
    }
  }
  
  // Add a new method to display the server restart notice
  addServerRestartNotice() {
    const notice = document.createElement('div');
    notice.className = 'message bot-message server-notice';
    notice.innerHTML = `
      <div class="message-content">
        <p><strong>Note:</strong> The first request may take 1-2 minutes to respond as the server needs time to restart. Thank you for your patience.</p>
      </div>
    `;
    this.chatMessages.appendChild(notice);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  async sendToAPI(question) {
    try {
      const response = await fetch('https://portfolio-backend-jqfj.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: question })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || "I didn't understand that. Could you try rephrasing?";
    } catch (error) {
      console.error('API Error:', error);
      return "I'm having trouble connecting to my brain right now. Please try again later!";
    }
  }
  
  convertInputToTextarea() {
    // Get the current input element
    const currentInput = this.messageInput;
    const placeholder = currentInput.placeholder;
    const parentElement = currentInput.parentElement;
    
    // Create new textarea element
    const textarea = document.createElement('textarea');
    textarea.id = 'message-input';
    textarea.placeholder = placeholder;
    textarea.rows = 1;
    
    // Replace input with textarea
    parentElement.replaceChild(textarea, currentInput);
    
    // Update the reference
    this.messageInput = textarea;
    
    // Initial resize
    this.autoResizeInput();
  }
  
  autoResizeInput() {
    // Reset height to calculate new height
    this.messageInput.style.height = 'auto';
    
    // Set new height based on content (with max height limit)
    const newHeight = Math.min(this.messageInput.scrollHeight, 100);
    this.messageInput.style.height = newHeight + 'px';
    
    // Scroll to bottom if needed
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}

// Initialize chat bot when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new ChatBot();
});