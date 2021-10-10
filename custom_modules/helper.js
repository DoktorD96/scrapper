module.exports = {
    sleep: (sleep) => {
        return new Promise(function(resolve) {
            setTimeout(function() { resolve("true"); }, sleep * 1000);
        });
    },
    headlessdetect: () => {
        window.Notification = {
            permission: 'granted'
        }
        window.chrome = {
            loadTimes: function() {
                return "function () { [native code] }";
            },
            csi: function() {
                return "function () { [native code] }";
            }
        }
        delete navigator.__proto__.webdriver;
        var __originalNavigator = navigator;
        navigator = new Object();
        navigator.__proto__ = __originalNavigator;
        navigator.permissions.__defineGetter__('query', function() { return "granted"; });
        navigator.__defineGetter__('permission', function() { return "granted"; });
        Object.defineProperty(Notification, 'permission', {
            get: () => "denied",
        });
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => 8
        });
    }
}