async function enforceBlock() {
  const { focusCoins = 0, igUnlockUntil = 0 } = await chrome.storage.sync.get([
    "focusCoins",
    "igUnlockUntil"
  ]);

  const now = Date.now();
  const isUnlocked = igUnlockUntil > now;

  if (focusCoins < 50 &&!isUnlocked) {
    document.documentElement.innerHTML = `
      <div style="font-family: system-ui; background: #0f172a; color: #f1f5f9;
                  height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <div>
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">💪 The Muscle</h1>
          <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Instagram is locked</h2>
          <p style="opacity: 0.8; margin-bottom: 0.5rem;">You have ${focusCoins} Focus Coins</p>
          <p style="opacity: 0.8; margin-bottom: 2rem;">Spend 50 coins for 10 minutes of access</p>
          <p style="opacity: 0.6;">Earn coins in <b>The Brain</b> dashboard</p>
          <button onclick="window.close()" style="
            margin-top: 20px; padding: 12px 24px; background: #3b82f6; 
            border: none; border-radius: 8px; color: white; font-size: 1rem; cursor: pointer;
          ">Close Tab</button>
        </div>
      </div>
    `;
    document.body.style.overflow = "hidden";
  }
}

enforceBlock();
chrome.storage.onChanged.addListener(enforceBlock);