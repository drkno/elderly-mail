
const restoreLayout = async(tab) => {
    await browser.mailTabs.update(tab, {
        layout: 'vertical',
        folderPaneVisible: true,
        messagePaneVisible: true,
        sortType: 'date',
        sortOrder: 'descending'
    });
};

const resetQuickFilter = async(tab) => {
    await browser.mailTabs.setQuickFilter(tab, {
        attachment: false,
        contact: false,
        flagged: false,
        show: true,
        tags: false,
        text: {
            text: ''
        },
        unread: false
    });
};

const resetTab = async(tab, resetFilter) => {
    await restoreLayout(tab.id);
    if (resetFilter) {
        await resetQuickFilter(tab.id);
    }
};

const fixTabs = async(resetFilter) => {
    const activeTabs = await browser.tabs.query({
        mailTab: true
    });

    for (let activeTab of activeTabs) {
        resetTab(activeTab, resetFilter);
    }
};

(async() => {
    browser.tabs.onCreated.addListener(() => fixTabs(false));
    await fixTabs(true);

    const currentWindow = await browser.windows.getCurrent();
    if (currentWindow.type === 'normal') {
        await browser.internals.startBackgroundProcess(currentWindow.id);
    }

    browser.windows.onCreated.addListener(newWindow => {
        if (newWindow.type === 'normal') {
            browser.internals.startBackgroundProcess(newWindow.id);
        }
    });

    browser.windows.onRemoved.addListener(windowId => {
        browser.internals.stopBackgroundProcess(windowId);
    });
})();
