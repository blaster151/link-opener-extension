// Background script for Link Lasso
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTab') {
        chrome.tabs.create({
            url: request.url,
            active: request.active
        });
    }
}); 