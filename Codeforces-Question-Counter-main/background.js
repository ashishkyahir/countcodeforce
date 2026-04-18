// Background service worker for periodic updates when tracking is active

// Firefox compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Create alarm for periodic updates (every 1 minute when tracking is active)
browserAPI.runtime.onInstalled.addListener(() => {
  browserAPI.alarms.create('updateStats', { periodInMinutes: 1 });
});

// Listen for tab updates to detect submission pages
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a Codeforces submission, problem, or status page
    if (tab.url.includes('codeforces.com/problemset/submit') || 
        tab.url.includes('codeforces.com/contest/') ||
        tab.url.includes('codeforces.com/problemset/status') ||
        tab.url.includes('codeforces.com/problemset/problem') ||
        tab.url.includes('codeforces.com/gym/')) {
      // Wait for submission to be processed then update (2 seconds)
      setTimeout(() => updateProblemCount(), 2000);
    }
  }
});

// Listen for manual update requests from popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateNow') {
    updateProblemCount().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
});

// Fetch submissions from Codeforces API
async function fetchSubmissions(handle) {
  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return null;
    }
    
    return data.result;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return null;
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

// Get list of problems solved after baseline
function getProblemsSolvedAfterBaseline(submissions, baselineProblems) {
  const currentSolved = new Map();
  
  submissions.forEach(submission => {
    if (submission.verdict === 'OK') {
      const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
      if (!currentSolved.has(problemId)) {
        currentSolved.set(problemId, {
          contestId: submission.problem.contestId,
          index: submission.problem.index,
          rating: submission.problem.rating || 'Unrated',
          timestamp: submission.creationTimeSeconds
        });
      }
    }
  });
  
  // Filter out baseline problems
  const newProblems = [];
  currentSolved.forEach((problem, problemId) => {
    if (!baselineProblems.has(problemId)) {
      newProblems.push(problem);
    }
  });
  
  // Sort by timestamp (newest first)
  newProblems.sort((a, b) => b.timestamp - a.timestamp);
  return newProblems;
}

// Update problem count and badge
async function updateProblemCount() {
  const data = await browserAPI.storage.local.get(['cfHandle', 'isTracking', 'baselineCount', 'baselineProblems']);
  
  if (!data.cfHandle || !data.isTracking) {
    // Clear badge if not tracking
    browserAPI.browserAction.setBadgeText({ text: '' });
    return;
  }
  
  const submissions = await fetchSubmissions(data.cfHandle);
  
  if (submissions) {
    const totalCount = countTotalProblems(submissions);
    const displayCount = totalCount - (data.baselineCount || 0);
    
    // Get baseline problems set
    const baselineProblems = new Set(data.baselineProblems || []);
    const solvedProblems = getProblemsSolvedAfterBaseline(submissions, baselineProblems);
    
    await browserAPI.storage.local.set({
      currentCount: totalCount,
      solvedProblems: solvedProblems,
      lastUpdate: Date.now()
    });
    
    // Update badge
    browserAPI.browserAction.setBadgeText({ text: displayCount.toString() });
    browserAPI.browserAction.setBadgeBackgroundColor({ color: '#667eea' });
  }
}

// Handle alarms
browserAPI.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateStats') {
    updateProblemCount();
  }
});

// Update on browser startup
browserAPI.runtime.onStartup.addListener(() => {
  updateProblemCount();
});
