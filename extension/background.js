const DEFAULT_API_URL = 'https://backend-steel-three-33.vercel.app';

async function getBackendUrl() {
  const stored = await chrome.storage.sync.get(['backendUrl']);
  return stored.backendUrl || DEFAULT_API_URL;
}

async function saveJob(job) {
  const backendUrl = await getBackendUrl();
  const response = await fetch(`${backendUrl}/api/jobs/save-from-extension`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(job)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Failed to save job');
  }

  await chrome.storage.local.set({
    lastScrapeResult: {
      ok: true,
      savedAt: new Date().toISOString(),
      job: payload.data
    }
  });

  return payload;
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_JOB' });
    const job = {
      ...response,
      url: tab.url || response.url,
      source: 'chrome-extension'
    };

    await saveJob(job);
    chrome.action.setBadgeText({ text: 'OK', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#0f766e', tabId: tab.id });
  } catch (error) {
    await chrome.storage.local.set({
      lastScrapeResult: {
        ok: false,
        savedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      }
    });
    chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#be123c', tabId: tab.id });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'SAVE_JOB') {
    return false;
  }

  saveJob(message.payload)
    .then((payload) => sendResponse({ ok: true, payload }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
