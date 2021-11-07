class InternalsApi extends ExtensionCommon.ExtensionAPI {
    constructor(...args) {
        super(...args);
        this.windows = {};
        this.internalMods = [];
    }

    getAPI(context) {
        context.callOnClose(this);

        return {
            internals: {
                startBackgroundProcess: (...args) => this.startBackgroundProcess(context, ...args),
                stopBackgroundProcess: (...args) => this.stopBackgroundProcess(context, ...args)
            }
        }
    }

    async startBackgroundProcess(context, windowId) {
        const window = context.extension.windowManager.get(windowId, context).window;
        for (let internalMod of this.internalMods) {
            await internalMod.attach(windowId, window);
        }
    }

    async stopBackgroundProcess(context, windowId) {
        const window = context.extension.windowManager.get(windowId, context).window;
        for (let internalMod of this.internalMods) {
            await internalMod.detach(windowId, window);
        }
    }

    registerInternal(attach, detach) {
        this.internalMods.push({
            attach,
            detach
        });
    }

    close() {
        for (let windowId in this.windows) {
            this.stopBackgroundProcess(windowId);
        }
    }
};

class ToolbarInternals extends InternalsApi {
    constructor(...args) {
        super(...args);
        this.registerInternal(
            this.preventToolbarClose.bind(this),
            this.cleanupToolbarClose.bind(this)
        );
        this.observers = {};
    }

    async preventToolbarClose(windowId, window) {
        const toolbar = window.document.getElementById('mail-bar3');
        if (!toolbar) {
            return;
        }

        this.observers[windowId] = new window.MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.target === toolbar
                    && mutation.attributeName === 'collapsed'
                    && !!toolbar.getAttribute('collapsed')) {
                    toolbar.removeAttribute('collapsed');
                }
            }
        });
    
        this.observers[windowId].observe(toolbar, {
            attributes: true,
            attributeFilter: ['collapsed']
        });
    
        toolbar.removeAttribute('collapsed');
    }

    async cleanupToolbarClose(windowId, window) {
        if (this.observers[windowId]) {
            this.observers[windowId].disconnect();
            delete this.observers[windowId];
        }
    }
}

this.internals = ToolbarInternals;
