chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== "FOCUS_REFUND_CLOSE_TAB" || !sender.tab?.id) {
    return;
  }

  chrome.tabs.remove(sender.tab.id);
});
