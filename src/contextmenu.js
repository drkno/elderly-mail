(async() => {
    const activeTabs = await browser.tabs.query({});

    for (let activeTab of activeTabs) {
        browser.menus.overrideContext({
            tabId: activeTab.id,
            showDefaults: false
        });
    }
})();
