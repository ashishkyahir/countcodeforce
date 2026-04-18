// Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// DOM elements
const setupSection = document.getElementById('setup-section');
const statsSection = document.getElementById('stats-section');
const handleInput = document.getElementById('handle-input');
const saveHandleBtn = document.getElementById('save-handle');
const changeHandleBtn = document.getElementById('change-handle');
const userHandleEl = document.getElementById('user-handle');
const questionCountEl = document.getElementById('question-count');
const trackingStatusEl = document.getElementById('tracking-status');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const refreshBtn = document.getElementById('refresh-btn');
const toggleProblemsBtn = document.getElementById('toggle-problems');
const problemsList = document.getElementById('problems-list');
const errorMsg = document.getElementById('error-msg');
const loading = document.getElementById('loading');

// Initialize popup
async function init() {
  const data = await browserAPI.storage.local.get(['cfHandle', 'isTracking', 'baselineCount', 'currentCount', 'startTime', 'solvedProblems']);
  
  if (data.cfHandle) {
    showStatsSection(data.cfHandle);
    const count = data.isTracking ? (data.currentCount || 0) - (data.baselineCount || 0) : 0;
    updateStats(count);
    updateTrackingStatus(data.isTracking || false, data.startTime);
    displayProblems(data.solvedProblems || []);
  } else {
    showSetupSection();
  }
}

// Show setup section
function showSetupSection() {
  setupSection.classList.remove('hidden');
  statsSection.classList.add('hidden');
}

// Show stats section
function showStatsSection(handle) {
  setupSection.classList.add('hidden');
  statsSection.classList.remove('hidden');
  userHandleEl.textContent = handle;
}

// Update stats display
function updateStats(count) {
  questionCountEl.textContent = count;
}

// Display solved problems list
function displayProblems(problems) {
  if (!problems || problems.length === 0) {
    problemsList.innerHTML = '<div class="no-problems">No problems solved yet today</div>';
    return;
  }
  
  problemsList.innerHTML = problems.map(problem => {
    const problemCode = `${problem.contestId}${problem.index}`;
    const problemUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
    const ratingClass = problem.rating === 'Unrated' ? 'unrated' : '';
    
    return `
      <div class="problem-item">
        <a href="${problemUrl}" target="_blank" class="problem-link">${problemCode}</a>
        <span class="problem-rating ${ratingClass}">${problem.rating}</span>
      </div>
    `;
  }).join('');
}

// Update tracking status display
function updateTrackingStatus(isTracking, startTime) {
  if (isTracking) {
    trackingStatusEl.textContent = 'Tracking active';
    trackingStatusEl.classList.add('tracking');
    startBtn.textContent = 'Stop Tracking';
    startBtn.classList.add('reset-btn');
    startBtn.classList.remove('start-btn');
  } else {
    trackingStatusEl.textContent = 'Not tracking';
    trackingStatusEl.classList.remove('tracking');
    startBtn.textContent = 'Start Tracking';
    startBtn.classList.add('start-btn');
    startBtn.classList.remove('reset-btn');
  }
}

// Fetch submissions from Codeforces API
async function fetchSubmissions(handle) {
  try {
    console.log('Fetching from Codeforces API for handle:', handle);
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('API response:', data);
    
    if (data.status !== 'OK') {
      throw new Error(data.comment || 'Failed to fetch submissions');
    }
    
    return data.result;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`API Error: ${error.message}`);
  }
}

// Count total problems solved
function countTotalProblems(submissions) {
  const solvedProblems = new Set();
  
  submissions.forEach(submission => {
    if (submission.verdict === 'OK') {
      const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
      solvedProblems.add(problemId);
    }
  });
  
  return solvedProblems.size;
}

// Count problems solved after a certain timestamp
function countProblemsSince(submissions, timestampSeconds) {
  const solvedProblems = new Set();
  
  submissions.forEach(submission => {
    if (submission.verdict === 'OK' && submission.creationTimeSeconds >= timestampSeconds) {
      const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
      solvedProblems.add(problemId);
    }
  });
  
  return solvedProblems.size;
}

// Show error message
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
  setTimeout(() => {
    errorMsg.classList.add('hidden');
  }, 5000);
}

// Show loading
function showLoading(show) {
  if (show) {
    loading.classList.remove('hidden');
  } else {
    loading.classList.add('hidden');
  }
}

// Update current problem count
async function updateCurrentCount(handle) {
  showLoading(true);
  errorMsg.classList.add('hidden');
  
  try {
    const submissions = await fetchSubmissions(handle);
    const totalCount = countTotalProblems(submissions);
    
    await browserAPI.storage.local.set({
      currentCount: totalCount,
      lastUpdate: Date.now()
    });
    
    const data = await browserAPI.storage.local.get(['isTracking', 'baselineCount']);
    if (data.isTracking) {
      const displayCount = totalCount - (data.baselineCount || 0);
      updateStats(displayCount);
    }
    
    showLoading(false);
    return totalCount;
  } catch (error) {
    showLoading(false);
    showError(error.message);
    return null;
  }
}

// Event listeners
saveHandleBtn.addEventListener('click', async () => {
  const handle = handleInput.value.trim();
  
  if (!handle) {
    showError('Please enter a valid handle');
    return;
  }
  
  showLoading(true);
  
  try {
    // Verify handle exists
    const submissions = await fetchSubmissions(handle);
    const totalCount = countTotalProblems(submissions);
    
    await browserAPI.storage.local.set({
      cfHandle: handle,
      currentCount: totalCount,
      baselineCount: 0,
      isTracking: false,
      lastUpdate: Date.now()
    });
    
    showLoading(false);
    showStatsSection(handle);
    updateStats(0);
    updateTrackingStatus(false);
  } catch (error) {
    showLoading(false);
    showError(error.message);
  }
});

changeHandleBtn.addEventListener('click', () => {
  handleInput.value = '';
  showSetupSection();
});

startBtn.addEventListener('click', async () => {
  console.log('Start button clicked');
  const data = await browserAPI.storage.local.get(['cfHandle', 'isTracking', 'currentCount']);
  console.log('Current data:', data);
  
  if (!data.cfHandle) return;
  
  if (data.isTracking) {
    // Stop tracking
    await browserAPI.storage.local.set({
      isTracking: false,
      baselineCount: 0
    });
    updateStats(0);
    updateTrackingStatus(false);
  } else {
    // Start tracking
    showLoading(true);
    console.log('Fetching submissions for:', data.cfHandle);
    
    try {
      const submissions = await fetchSubmissions(data.cfHandle);
      const totalCount = countTotalProblems(submissions);
      
      // Store baseline problems
      const baselineProblems = [];
      submissions.forEach(submission => {
        if (submission.verdict === 'OK') {
          const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
          baselineProblems.push(problemId);
        }
      });
      
      await browserAPI.storage.local.set({
        isTracking: true,
        baselineCount: totalCount,
        baselineProblems: baselineProblems,
        solvedProblems: [],
        currentCount: totalCount,
        startTime: Date.now(),
        lastUpdate: Date.now()
      });
      
      console.log('Tracking started with baseline:', totalCount);
      updateStats(0);
      displayProblems([]);
      updateTrackingStatus(true, Date.now());
      showLoading(false);
    } catch (error) {
      console.error('Start tracking error:', error);
      showLoading(false);
      showError('Failed to start tracking. Please try again.');
    }
  }
});

resetBtn.addEventListener('click', async () => {
  console.log('Reset button clicked');
  const data = await browserAPI.storage.local.get(['cfHandle', 'isTracking']);
  console.log('Current data:', data);
  
  if (!data.cfHandle) return;
  
  if (confirm('Are you sure you want to reset the count?')) {
    if (data.isTracking) {
      showLoading(true);
      const totalCount = await updateCurrentCount(data.cfHandle);
      
      if (totalCount !== null) {
        await browserAPI.storage.local.set({
          baselineCount: totalCount
        });
        updateStats(0);
      }
    } else {
      updateStats(0);
    }
  }
});

refreshBtn.addEventListener('click', async () => {
  console.log('Refresh button clicked');
  const data = await browserAPI.storage.local.get(['cfHandle', 'isTracking']);
  
  if (!data.cfHandle) {
    showError('No handle configured');
    return;
  }
  
  showLoading(true);
  
  // Trigger immediate update in background script
  try {
    await browserAPI.runtime.sendMessage({ action: 'updateNow' });
    
    // Refresh the display
    const updatedData = await browserAPI.storage.local.get(['currentCount', 'baselineCount', 'isTracking', 'solvedProblems']);
    if (updatedData.isTracking) {
      const displayCount = (updatedData.currentCount || 0) - (updatedData.baselineCount || 0);
      updateStats(displayCount);
      displayProblems(updatedData.solvedProblems || []);
    }
    
    showLoading(false);
  } catch (error) {
    showLoading(false);
    showError('Refresh failed. Please try again.');
  }
});

toggleProblemsBtn.addEventListener('click', () => {
  problemsList.classList.toggle('hidden');
  if (problemsList.classList.contains('hidden')) {
    toggleProblemsBtn.textContent = '▼ Show Solved Problems';
  } else {
    toggleProblemsBtn.textContent = '▲ Hide Solved Problems';
  }
});

// Initialize on load
init();
