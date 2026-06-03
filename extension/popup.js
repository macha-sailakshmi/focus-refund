document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['focusCoins'], (result) => {
    const coins = result.focusCoins || 0;
    document.getElementById('balance').textContent = coins;
  });
});

document.getElementById('unlockBtn').addEventListener('click', () => {
  chrome.storage.sync.get(['focusCoins'], (result) => {
    const coins = result.focusCoins || 0;
    if (coins >= 50) {
      const unlockUntil = Date.now() + 10 * 60 * 1000; // 10 min timer
      chrome.storage.sync.set({
        focusCoins: coins - 50,
        igUnlockUntil: unlockUntil
      }, () => {
        alert('Unlocked distracting sites for 10 min. Refresh the blocked tab.');
        location.reload(); // refresh popup
      });
    } else {
      alert(`Need ${50 - coins} more coins. Go to The Brain!`);
    }
  });
});

document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({url: chrome.runtime.getURL('dashboard/index.html')});
});
