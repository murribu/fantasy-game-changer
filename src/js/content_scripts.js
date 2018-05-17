chrome.storage.local.set({ 'current_page': window.location.href }, () => {});
chrome.storage.local.get('teams', teams => {
	if (typeof teams === 'object') { // Before it's initialized, it returns an empty object
		chrome.storage.local.set({ 'teams': [] }, () => {});
	}
});