// Content script for Scribe extension
// Adds hover icons to VK messages

class ScribeExtension {
  constructor() {
    this.iconAddedClass = "scribe-icon-added";
    this.iconHoverClass = "scribe-icon-hover";
    this.messageSelector = ".ConvoHistory__messageBlock";
    this.textSelector = ".MessageText";
    this.observer = null;
    this.init();
  }

  init() {
    // Start observing for messages
    this.setupObserver();

    // Also check existing messages
    this.addIconsToExistingMessages();

    // Listen for hover events
    this.setupHoverListeners();

    // Listen for reply injections from message-view page
    this.setupMessageListener();
  }

  setupObserver() {
    // Observe DOM for new messages
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          this.addIconsToNewNodes(mutation.addedNodes);
        }
      });
    });

    // Start observing the document
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  addIconsToExistingMessages() {
    const messages = document.querySelectorAll(this.messageSelector);
    messages.forEach((message) => this.addIconToMessage(message));
  }

  addIconsToNewNodes(nodes) {
    nodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Element node
        // Check if this node is a message
        if (node.matches && node.matches(this.messageSelector)) {
          this.addIconToMessage(node);
        }

        // Check children for messages
        const childMessages = node.querySelectorAll(this.messageSelector);
        childMessages.forEach((message) => this.addIconToMessage(message));
      }
    });
  }

  addIconToMessage(messageElement) {
    // Skip if icon already added
    if (messageElement.querySelector(`.${this.iconAddedClass}`)) {
      return;
    }

    // Find the message text container
    const textElement = messageElement.querySelector(this.textSelector);
    if (!textElement) return;

    // Create icon element
    const icon = this.createIconElement();

    // Add click handler
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleIconClick(textElement.textContent);
    });

    // Append to article so absolute positioning works correctly
    messageElement.style.position = "relative";
    messageElement.appendChild(icon);
  }

  createIconElement() {
    const icon = document.createElement("div");
    icon.className = this.iconAddedClass;
    icon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" rx="3" fill="#4A76A8"/>
        <path d="M4 5H12V11H4V5Z" fill="white"/>
        <path d="M6 7H10V9H6V7Z" fill="#4A76A8"/>
      </svg>
    `;
    icon.style.cssText = `
      position: absolute;
      top: 50%;
      right: 48px;
      transform: translateY(-50%);
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;
      z-index: 1000;
      background: white;
      border-radius: 3px;
      padding: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    `;

    return icon;
  }

  setupHoverListeners() {
    // Show icon on message hover
    document.addEventListener("mouseover", (e) => {
      const message = e.target.closest(this.messageSelector);
      if (message) {
        const icon = message.querySelector(`.${this.iconAddedClass}`);
        if (icon) {
          icon.style.opacity = "1";
          message.classList.add(this.iconHoverClass);
        }
      }
    });

    // Hide icon when leaving message
    document.addEventListener("mouseout", (e) => {
      const message = e.target.closest(this.messageSelector);
      if (message && !message.contains(e.relatedTarget)) {
        const icon = message.querySelector(`.${this.iconAddedClass}`);
        if (icon) {
          icon.style.opacity = "0";
          message.classList.remove(this.iconHoverClass);
        }
      }
    });
  }

  handleIconClick(messageText) {
    try {
      chrome.runtime.sendMessage(
        { action: "openMessageTab", text: messageText },
        (_response) => {
          if (chrome.runtime.lastError) {
            console.error("[Scribe] sendMessage error:", chrome.runtime.lastError.message);
          }
        }
      );
    } catch (e) {
      // Extension was reloaded while this tab was open — context is now invalid.
      // The only fix is for the user to refresh the page.
      console.warn("[Scribe] Extension context invalidated. Refresh the page (F5).");
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === "injectReply") {
        const success = this.injectReply(request.text);
        sendResponse({ success });
      }
      return true;
    });
  }

  injectReply(text) {
    const composer = document.querySelector("span.ComposerInput__input");
    if (!composer) return false;

    composer.focus();

    // Select any existing content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(composer);
    selection.removeAllRanges();
    selection.addRange(range);

    // Paste via DataTransfer — modern alternative to execCommand for
    // injecting text into React-managed contenteditable elements
    const dt = new DataTransfer();
    dt.setData("text/plain", text);
    composer.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      })
    );

    // Send after React has processed the paste event.
    // When text is present the button switches to ConvoComposer__sendButton--submit.
    setTimeout(() => {
      const sendBtn = document.querySelector(".ConvoComposer__sendButton--submit");
      if (sendBtn) {
        sendBtn.click();
      }
    }, 150);

    return true;
  }
}

// Initialize when page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ScribeExtension();
  });
} else {
  new ScribeExtension();
}
