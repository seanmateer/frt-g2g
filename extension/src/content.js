// FRT G2G - Facebook Group Post Extractor
// This content script adds "Import to G2G" buttons to Facebook group posts

(function() {
  'use strict';

  const BUTTON_CLASS = 'frt-g2g-import-btn';
  const PROCESSED_ATTR = 'data-frt-g2g-processed';

  // Trail keywords to help identify trail-related posts
  const TRAIL_KEYWORDS = [
    'trail', 'trails', 'conditions', 'muddy', 'dry', 'snow', 'ice', 'icy',
    'rideable', 'closed', 'open', 'wet', 'tacky', 'dusty', 'hero dirt',
    'north table', 'apex', 'green mountain', 'white ranch', 'buffalo creek',
    'hall ranch', 'betasso', 'walker ranch', 'chimney gulch', 'elk meadow',
    'matthews winters', 'lair o\' the bear', 'bear creek', 'heil valley',
    'south table', 'golden', 'boulder', 'morrison', 'evergreen', 'pine'
  ];

  // Create the import button
  function createImportButton(postElement) {
    const btn = document.createElement('button');
    btn.className = BUTTON_CLASS;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L12 16M12 16L8 12M12 16L16 12"/>
        <path d="M2 17L2 19C2 20.1 2.9 21 4 21L20 21C21.1 21 22 20.1 22 19L22 17"/>
      </svg>
      <span>Import to G2G</span>
    `;
    btn.title = 'Import this post to FRT G2G trail conditions';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleImportClick(postElement, btn);
    });

    return btn;
  }

  // Extract post data from a Facebook post element
  function extractPostData(postElement) {
    // Try to find the post text content
    // Facebook's DOM changes frequently, so we try multiple selectors
    const textSelectors = [
      '[data-ad-preview="message"]',
      '[data-ad-comet-preview="message"]',
      'div[dir="auto"][style*="text-align"]',
      'div[dir="auto"]'
    ];

    let postText = '';
    for (const selector of textSelectors) {
      const textEl = postElement.querySelector(selector);
      if (textEl && textEl.innerText.trim().length > 20) {
        postText = textEl.innerText.trim();
        break;
      }
    }

    // If we still don't have text, try getting all text from the post
    if (!postText) {
      // Get the main content area, avoiding metadata
      const contentDivs = postElement.querySelectorAll('div[dir="auto"]');
      for (const div of contentDivs) {
        const text = div.innerText.trim();
        if (text.length > 50 && !text.includes('Like') && !text.includes('Comment')) {
          postText = text;
          break;
        }
      }
    }

    // Try to get author name
    let authorName = 'Unknown';
    const authorSelectors = [
      'a[role="link"] strong',
      'h2 a strong',
      'h3 a strong',
      'span.x193iq5w strong'
    ];
    for (const selector of authorSelectors) {
      const authorEl = postElement.querySelector(selector);
      if (authorEl) {
        authorName = authorEl.innerText.trim();
        break;
      }
    }

    // Try to get timestamp
    let timestamp = new Date().toISOString();
    const timeSelectors = [
      'a[role="link"] span[id]',
      'span[id] a',
      'abbr[data-utime]'
    ];
    for (const selector of timeSelectors) {
      const timeEl = postElement.querySelector(selector);
      if (timeEl) {
        // Facebook often shows relative time, we'll use current time as fallback
        const timeText = timeEl.innerText || timeEl.getAttribute('title');
        if (timeText) {
          // Try to parse the time text (this is rough)
          timestamp = parseRelativeTime(timeText) || timestamp;
        }
        break;
      }
    }

    // Get any images
    const images = [];
    const imgElements = postElement.querySelectorAll('img[src*="scontent"]');
    imgElements.forEach(img => {
      if (img.src && !img.src.includes('emoji') && img.width > 100) {
        images.push(img.src);
      }
    });

    return {
      text: postText,
      author: authorName,
      timestamp: timestamp,
      images: images,
      sourceUrl: window.location.href,
      extractedAt: new Date().toISOString()
    };
  }

  // Parse relative time strings like "2h", "Yesterday at 3:00 PM"
  function parseRelativeTime(timeStr) {
    const now = new Date();

    if (timeStr.includes('Just now') || timeStr.includes('now')) {
      return now.toISOString();
    }

    const hourMatch = timeStr.match(/(\d+)\s*h/);
    if (hourMatch) {
      now.setHours(now.getHours() - parseInt(hourMatch[1]));
      return now.toISOString();
    }

    const minMatch = timeStr.match(/(\d+)\s*m/);
    if (minMatch) {
      now.setMinutes(now.getMinutes() - parseInt(minMatch[1]));
      return now.toISOString();
    }

    if (timeStr.includes('Yesterday')) {
      now.setDate(now.getDate() - 1);
      return now.toISOString();
    }

    return null;
  }

  // Check if post text is likely about trail conditions
  function isTrailRelated(text) {
    const lowerText = text.toLowerCase();
    let matchCount = 0;

    for (const keyword of TRAIL_KEYWORDS) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++;
        if (matchCount >= 2) return true; // At least 2 keywords
      }
    }

    return matchCount >= 1; // At least 1 keyword for now
  }

  // Handle import button click
  async function handleImportClick(postElement, btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
      </svg>
      <span>Extracting...</span>
    `;

    try {
      const postData = extractPostData(postElement);

      if (!postData.text || postData.text.length < 10) {
        throw new Error('Could not extract post text');
      }

      // Store the extracted data
      await chrome.storage.local.set({
        pendingImport: postData,
        importTimestamp: Date.now()
      });

      // Open the popup or notify
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17L4 12"/>
        </svg>
        <span>Extracted!</span>
      `;
      btn.classList.add('success');

      // Show a notification to open popup
      showNotification('Post extracted! Click the extension icon to review and import.');

    } catch (error) {
      console.error('FRT G2G extraction error:', error);
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>Error</span>
      `;
      btn.classList.add('error');
    }

    // Reset button after delay
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('success', 'error');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L12 16M12 16L8 12M12 16L16 12"/>
          <path d="M2 17L2 19C2 20.1 2.9 21 4 21L20 21C21.1 21 22 20.1 22 19L22 17"/>
        </svg>
        <span>Import to G2G</span>
      `;
    }, 3000);
  }

  // Show a toast notification
  function showNotification(message) {
    const existing = document.querySelector('.frt-g2g-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'frt-g2g-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Find and process Facebook posts
  function processPage() {
    // Facebook uses various containers for posts
    const postSelectors = [
      'div[role="article"]',
      'div[data-pagelet*="FeedUnit"]',
      'div[data-pagelet*="GroupFeed"] > div > div'
    ];

    for (const selector of postSelectors) {
      const posts = document.querySelectorAll(selector);

      posts.forEach(post => {
        // Skip if already processed
        if (post.hasAttribute(PROCESSED_ATTR)) return;

        // Mark as processed
        post.setAttribute(PROCESSED_ATTR, 'true');

        // Check if this looks like a trail-related post
        const postText = post.innerText || '';
        if (!isTrailRelated(postText)) return;

        // Find a good place to insert the button
        // Look for the actions bar (like, comment, share)
        const actionBars = post.querySelectorAll('div[role="button"]');
        let targetContainer = null;

        for (const bar of actionBars) {
          const parent = bar.parentElement;
          if (parent && parent.children.length >= 2) {
            targetContainer = parent;
            break;
          }
        }

        // Fallback: just add to the post itself
        if (!targetContainer) {
          targetContainer = post;
        }

        // Check if we already added a button here
        if (targetContainer.querySelector('.' + BUTTON_CLASS)) return;

        // Create and add the button
        const btn = createImportButton(post);

        // Create a wrapper to position our button
        const wrapper = document.createElement('div');
        wrapper.className = 'frt-g2g-btn-wrapper';
        wrapper.appendChild(btn);

        targetContainer.appendChild(wrapper);
      });
    }
  }

  // Initial processing
  processPage();

  // Watch for new posts being loaded (infinite scroll)
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
        break;
      }
    }
    if (shouldProcess) {
      // Debounce
      clearTimeout(window.frtG2GDebounce);
      window.frtG2GDebounce = setTimeout(processPage, 500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('FRT G2G extension loaded');
})();
