const statusBox = document.getElementById('status');

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function scrape() {
  const tab = await activeTab();
  const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_JOB' });
  return { ...response, url: tab.url || response.url, source: 'chrome-extension' };
}

async function send(type) {
  statusBox.textContent = 'Working...';
  try {
    const job = await scrape();
    if (type === 'SAVE_JOB') {
      const saved = await chrome.runtime.sendMessage({ type: 'SAVE_JOB', payload: job });
      if (!saved?.ok) {
        throw new Error(saved?.error || 'Could not save this job.');
      }
      statusBox.textContent = `Saved: ${saved.payload?.data?.title || job.title}`;
      return;
    }
    await chrome.storage.local.set({ lastScrapeResult: { ok: true, savedAt: new Date().toISOString(), action: type, job } });
    statusBox.textContent = `${type} ready in web app. Job captured: ${job.title}`;
  } catch (error) {
    statusBox.textContent = error instanceof Error ? error.message : String(error);
  }
}

document.getElementById('save').addEventListener('click', () => send('SAVE_JOB'));
document.getElementById('analyze').addEventListener('click', () => send('ANALYZE_JOB'));
document.getElementById('kit').addEventListener('click', () => send('APPLICATION_KIT'));
document.getElementById('manual').addEventListener('click', () => send('MANUAL_APPLIED'));
