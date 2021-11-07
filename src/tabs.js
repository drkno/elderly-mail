const closeAllOtherTabs = async() => {
    const tabs = (await browser.tabs.query({
            mailTab: false
        }))
        .filter(tab => tab.index !== 0)
        .map(tab => tab.id);
    
    browser.tabs.remove(tabs);
};

const convertToPopup = tab => {
    if (tab.index === 0) {
        // first tab in the window, avoid an infinite loop
        return;
    }
    browser.windows.create({
        type: 'popup',
		tabId: tab.id
    });
};

closeAllOtherTabs();
browser.tabs.onCreated.addListener(convertToPopup);
