async function enforceBlock() {
  const { focusCoins = 0, igUnlockUntil = 0 } = await chrome.storage.sync.get([
    "focusCoins",
    "igUnlockUntil"
  ]);

  const now = Date.now();
  const isUnlocked = igUnlockUntil > now;

  if (!isUnlocked) {
    document.documentElement.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; }
        .focus-refund-lock {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: #f8fafc;
          font-family: "Cascadia Code", "Roboto Mono", "JetBrains Mono", "Consolas", monospace;
          text-align: center;
          background:
            radial-gradient(circle at 25% 12%, rgba(59, 130, 246, 0.28), transparent 30rem),
            radial-gradient(circle at 78% 88%, rgba(34, 197, 94, 0.18), transparent 28rem),
            #0f172a;
        }
        .focus-refund-card {
          width: min(520px, 100%);
          padding: 42px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 26px;
          background: rgba(15, 23, 42, 0.76);
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.38);
          animation: focusRefundRise 420ms ease both;
        }
        .focus-refund-eyebrow {
          color: #93c5fd;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .focus-refund-card h1 {
          font-family: "Cascadia Code", "Roboto Mono", "JetBrains Mono", "Consolas", monospace;
          margin: 14px 0 10px;
          font-size: clamp(2.2rem, 6vw, 3.8rem);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -0.03em;
        }
        .focus-refund-card h2 {
          font-family: "Cascadia Code", "Roboto Mono", "JetBrains Mono", "Consolas", monospace;
          margin: 0 0 24px;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.015em;
        }
        .focus-refund-card p {
          margin: 12px 0;
          color: #cbd5e1;
          font-size: 0.96rem;
          line-height: 1.6;
        }
        .focus-refund-balance {
          margin: 24px auto;
          width: fit-content;
          min-width: 180px;
          padding: 16px 22px;
          border: 1px solid rgba(250, 204, 21, 0.32);
          border-radius: 18px;
          background: rgba(250, 204, 21, 0.12);
        }
        .focus-refund-balance strong {
          color: #facc15;
          font-size: 2rem;
        }
        #focusRefundCloseTab {
          min-height: 48px;
          margin-top: 22px;
          padding: 0 24px;
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          border: none;
          border-radius: 12px;
          color: white;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        #focusRefundCloseTab:hover { transform: translateY(-2px); }
        @keyframes focusRefundRise {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <div class="focus-refund-lock">
        <div class="focus-refund-card">
          <div class="focus-refund-eyebrow">The Muscle</div>
          <h1>Pause.</h1>
          <h2>Instagram is locked</h2>
          <div class="focus-refund-balance">
            <p>You have</p>
            <strong>${focusCoins}</strong>
            <p>Focus Coins</p>
          </div>
          <p>Spend 50 coins for 10 minutes of access.</p>
          <p>Earn coins in <b>The Brain</b> dashboard.</p>
          <button id="focusRefundCloseTab">Close Tab</button>
        </div>
      </div>
    `;
    document.documentElement.style.overflow = "hidden";
    document.getElementById("focusRefundCloseTab")?.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "FOCUS_REFUND_CLOSE_TAB" });
    });
  }
}

enforceBlock();
chrome.storage.onChanged.addListener(enforceBlock);
