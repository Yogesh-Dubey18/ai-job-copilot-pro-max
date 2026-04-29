const input = document.getElementById('backendUrl');
const status = document.getElementById('status');
const save = document.getElementById('save');

chrome.storage.sync.get(['backendUrl'], (stored) => {
  input.value = stored.backendUrl || 'https://backend-steel-three-33.vercel.app';
});

save.addEventListener('click', () => {
  const backendUrl = input.value.trim().replace(/\/$/, '');
  chrome.storage.sync.set({ backendUrl }, () => {
    status.textContent = 'Saved.';
  });
});
