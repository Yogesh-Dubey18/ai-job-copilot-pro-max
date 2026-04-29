const input = document.getElementById('backendUrl');
const status = document.getElementById('status');
const save = document.getElementById('save');

chrome.storage.sync.get(['backendUrl'], (stored) => {
  input.value = stored.backendUrl || 'https://backend-steel-three-33.vercel.app';
});

chrome.storage.local.get(['lastScrapeResult'], (stored) => {
  const lastResult = document.getElementById('lastResult');
  lastResult.textContent = stored.lastScrapeResult ? JSON.stringify(stored.lastScrapeResult, null, 2) : 'No scrape yet.';
});

save.addEventListener('click', () => {
  const backendUrl = input.value.trim().replace(/\/$/, '');
  if (!/^https?:\/\//.test(backendUrl)) {
    status.textContent = 'Enter a valid http/https backend URL.';
    return;
  }
  chrome.storage.sync.set({ backendUrl }, () => {
    status.textContent = 'Saved.';
  });
});
