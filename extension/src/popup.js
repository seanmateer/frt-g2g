// FRT G2G Extension Popup
// Handles reviewing extracted posts and sending to the API

const API_BASE_URL = 'http://localhost:3000'; // Change to your deployed URL

// Trail centers for matching
const TRAIL_CENTERS = [
  { id: 'north-table', names: ['north table', 'ntm', 'north table mountain'] },
  { id: 'south-table', names: ['south table', 'stm', 'south table mountain'] },
  { id: 'apex', names: ['apex', 'apex park'] },
  { id: 'white-ranch', names: ['white ranch', 'white ranch park'] },
  { id: 'green-mountain', names: ['green mountain', 'green mtn', 'hayden'] },
  { id: 'bear-creek', names: ['bear creek lake', 'bear creek park'] },
  { id: 'matthews-winters', names: ['matthews winters', 'matthews/winters', 'dakota ridge', 'red rocks trail'] },
  { id: 'lair-o-bear', names: ['lair o\' the bear', 'lair o the bear', 'lair of the bear'] },
  { id: 'betasso', names: ['betasso', 'betasso preserve'] },
  { id: 'walker-ranch', names: ['walker ranch', 'walker'] },
  { id: 'hall-ranch', names: ['hall ranch', 'nelson loop', 'bitterbrush'] },
  { id: 'heil-valley', names: ['heil valley', 'heil ranch', 'picture rock'] },
  { id: 'buffalo-creek', names: ['buffalo creek', 'buff creek', 'sandy wash', 'charlie loves amber', 'cla'] },
  { id: 'elk-meadow', names: ['elk meadow', 'bergen peak'] },
  { id: 'chimney-gulch', names: ['chimney gulch', 'windy saddle'] },
];

// Status keywords for local parsing
const STATUS_PATTERNS = {
  open: ['dry', 'good', 'great', 'perfect', 'hero dirt', 'tacky', 'prime', 'excellent', 'rideable', 'open', 'g2g', 'good to go', 'send it'],
  muddy: ['muddy', 'wet', 'mud', 'sloppy', 'saturated', 'soft', 'damp', 'moist', 'standing water', 'puddles'],
  snowy: ['snow', 'snowy', 'ice', 'icy', 'frozen', 'frost', 'slick', 'packed snow', 'drifts'],
  closed: ['closed', 'closure', 'shut down', 'not rideable', 'stay off', 'do not ride', 'damaged']
};

let currentPostData = null;
let parsedResult = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadPendingImport();
});

// Load any pending import from storage
async function loadPendingImport() {
  const data = await chrome.storage.local.get(['pendingImport', 'importTimestamp']);

  if (!data.pendingImport) {
    showEmptyState();
    return;
  }

  // Check if import is stale (older than 10 minutes)
  const age = Date.now() - (data.importTimestamp || 0);
  if (age > 10 * 60 * 1000) {
    await chrome.storage.local.remove(['pendingImport', 'importTimestamp']);
    showEmptyState();
    return;
  }

  currentPostData = data.pendingImport;
  showPostPreview(currentPostData);
  await analyzePost(currentPostData);
}

// Show empty state when no post is pending
function showEmptyState() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"/>
      </svg>
      <h2>No Post Selected</h2>
      <p>Go to a Facebook group and click the "Import to G2G" button on a trail conditions post.</p>
    </div>
  `;
}

// Show the post preview
function showPostPreview(postData) {
  const content = document.getElementById('content');
  const truncatedText = postData.text.length > 300
    ? postData.text.substring(0, 300) + '...'
    : postData.text;

  content.innerHTML = `
    <div class="post-preview">
      <div class="post-meta">
        <span>${postData.author}</span>
        <span>${formatTimestamp(postData.timestamp)}</span>
      </div>
      <div class="post-text">${escapeHtml(truncatedText)}</div>
    </div>

    <div class="analysis-section" id="analysisSection">
      <h3>AI Analysis</h3>
      <div class="analysis-loading" id="analysisLoading">
        <div class="spinner"></div>
        <span>Analyzing post...</span>
      </div>
      <div class="parsed-data" id="parsedData" style="display: none;"></div>
    </div>

    <div class="actions" id="actions" style="display: none;">
      <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
      <button class="btn btn-primary" id="importBtn">Import Report</button>
    </div>
  `;

  document.getElementById('cancelBtn')?.addEventListener('click', handleCancel);
  document.getElementById('importBtn')?.addEventListener('click', handleImport);
}

// Analyze the post using local parsing + optional API
async function analyzePost(postData) {
  try {
    // First, do local analysis
    parsedResult = localAnalysis(postData.text);

    // Try to enhance with API if available
    try {
      const apiResult = await fetchApiAnalysis(postData.text);
      if (apiResult) {
        // Merge API results with local (API takes precedence)
        parsedResult = {
          ...parsedResult,
          ...apiResult,
          confidence: apiResult.confidence || parsedResult.confidence
        };
      }
    } catch (apiError) {
      console.log('API analysis unavailable, using local parsing:', apiError.message);
    }

    showParsedResult(parsedResult);

  } catch (error) {
    console.error('Analysis error:', error);
    // Still show local results
    showParsedResult(parsedResult || localAnalysis(postData.text));
  }
}

// Local analysis without API
function localAnalysis(text) {
  const lowerText = text.toLowerCase();

  // Detect trail center
  let detectedCenter = null;
  let centerConfidence = 0;

  for (const center of TRAIL_CENTERS) {
    for (const name of center.names) {
      if (lowerText.includes(name)) {
        detectedCenter = center.id;
        centerConfidence = name.length > 5 ? 0.9 : 0.7;
        break;
      }
    }
    if (detectedCenter) break;
  }

  // Detect status
  let detectedStatus = 'unknown';
  let statusConfidence = 0;
  let statusMatches = {};

  for (const [status, keywords] of Object.entries(STATUS_PATTERNS)) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
      }
    }
    statusMatches[status] = matchCount;

    if (matchCount > 0 && matchCount > (statusMatches[detectedStatus] || 0)) {
      detectedStatus = status;
      statusConfidence = Math.min(0.9, 0.5 + (matchCount * 0.2));
    }
  }

  // Overall confidence
  const overallConfidence = (centerConfidence + statusConfidence) / 2;

  return {
    trailCenter: detectedCenter,
    status: detectedStatus !== 'unknown' ? detectedStatus : 'open',
    summary: extractSummary(text),
    confidence: overallConfidence,
    confidenceLevel: overallConfidence > 0.7 ? 'high' : overallConfidence > 0.4 ? 'medium' : 'low'
  };
}

// Extract a summary from the text
function extractSummary(text) {
  // Take first 2-3 sentences or 200 chars, whichever is shorter
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 2).join('. ').trim();

  if (summary.length > 200) {
    return summary.substring(0, 200) + '...';
  }

  return summary || text.substring(0, 200);
}

// Fetch API analysis (calls our Next.js API route)
async function fetchApiAnalysis(text) {
  const response = await fetch(`${API_BASE_URL}/api/parse-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// Show the parsed result in the UI
function showParsedResult(result) {
  document.getElementById('analysisLoading').style.display = 'none';

  const parsedDataEl = document.getElementById('parsedData');
  parsedDataEl.style.display = 'grid';

  const confidenceClass = result.confidenceLevel === 'high' ? 'confidence-high'
    : result.confidenceLevel === 'medium' ? 'confidence-medium'
    : 'confidence-low';

  parsedDataEl.innerHTML = `
    <div class="field-group">
      <label>Confidence</label>
      <span class="confidence-badge ${confidenceClass}">
        ${Math.round(result.confidence * 100)}% - ${result.confidenceLevel}
      </span>
    </div>

    <div class="field-group">
      <label>Trail System</label>
      <select id="trailCenter">
        <option value="">-- Select Trail --</option>
        ${TRAIL_CENTERS.map(c => `
          <option value="${c.id}" ${result.trailCenter === c.id ? 'selected' : ''}>
            ${formatTrailName(c.id)}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="field-group">
      <label>Condition</label>
      <div class="status-options">
        ${['open', 'muddy', 'snowy', 'closed'].map(status => `
          <label class="status-option ${result.status === status ? 'selected' : ''}">
            <input type="radio" name="status" value="${status}" ${result.status === status ? 'checked' : ''}>
            <span class="status-dot ${status}"></span>
            <span class="status-label">${formatStatus(status)}</span>
          </label>
        `).join('')}
      </div>
    </div>

    <div class="field-group">
      <label>Summary</label>
      <input type="text" id="summary" value="${escapeHtml(result.summary)}" placeholder="Brief description...">
    </div>
  `;

  // Add event listeners for status options
  document.querySelectorAll('.status-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.status-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      el.querySelector('input').checked = true;
    });
  });

  // Show actions
  document.getElementById('actions').style.display = 'flex';
}

// Handle cancel
async function handleCancel() {
  await chrome.storage.local.remove(['pendingImport', 'importTimestamp']);
  showEmptyState();
}

// Handle import
async function handleImport() {
  const importBtn = document.getElementById('importBtn');
  importBtn.disabled = true;
  importBtn.textContent = 'Importing...';

  const trailCenter = document.getElementById('trailCenter').value;
  const status = document.querySelector('input[name="status"]:checked')?.value;
  const summary = document.getElementById('summary').value;

  if (!trailCenter) {
    alert('Please select a trail system');
    importBtn.disabled = false;
    importBtn.textContent = 'Import Report';
    return;
  }

  try {
    // Submit to our API
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trailCenterId: trailCenter,
        status: status || 'open',
        comment: summary,
        timestamp: currentPostData.timestamp,
        reporterNickname: `FB: ${currentPostData.author}`,
        source: 'facebook',
        sourceUrl: currentPostData.sourceUrl,
        originalText: currentPostData.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit: ${response.status}`);
    }

    // Clear pending import
    await chrome.storage.local.remove(['pendingImport', 'importTimestamp']);

    // Show success
    showSuccess();

  } catch (error) {
    console.error('Import error:', error);
    alert(`Failed to import: ${error.message}`);
    importBtn.disabled = false;
    importBtn.textContent = 'Import Report';
  }
}

// Show success state
function showSuccess() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="success-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <h2>Report Imported!</h2>
      <p>The trail condition report has been added to FRT G2G.</p>
    </div>
    <div class="actions">
      <button class="btn btn-primary" onclick="window.close()">Done</button>
    </div>
  `;
}

// Utility functions
function formatTimestamp(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Unknown time';
  }
}

function formatTrailName(id) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatStatus(status) {
  const labels = {
    open: 'Open / Dry',
    muddy: 'Muddy',
    snowy: 'Snow / Ice',
    closed: 'Closed'
  };
  return labels[status] || status;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
