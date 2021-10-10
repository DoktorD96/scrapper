//real device props from
// #https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts


const realdevices = { //user agent and other relevant props
    "iPhone_X": {
        name: 'iPhone X',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        viewport: {
            width: 375,
            height: 812,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        }
    },
    "iPhone_XR": {
        name: 'iPhone XR',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        viewport: {
            width: 414,
            height: 896,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        }
    },
    "iPhone_7": {
        name: 'iPhone 7',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        viewport: {
            width: 375,
            height: 667,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        }
    },
    "iPhone_SE": {
        name: 'iPhone SE',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        viewport: {
            width: 320,
            height: 568,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        }
    },
    "Galaxy_S8": {
        name: 'Galaxy S8',
        userAgent: 'Mozilla/5.0 (Linux; Android 7.0; SM-G950U Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36',
        viewport: {
            width: 360,
            height: 740,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        }
    },
    "iPad": {
        name: 'iPad',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
        viewport: {
            width: 768,
            height: 1024,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            isLandscape: false
        }
    },
    "iPad_Pro": {
        name: 'iPad Pro',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
        viewport: {
            width: 1024,
            height: 1366,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            isLandscape: false,
        }
    },

};

// #devices for screenshots array helper

const deviceprops = [
    //Mobile Devices
    {
        resolution: "375x812",
        type: "Mobile",
        realProps: realdevices.iPhone_X
    },
    {
        resolution: "414x896",
        type: "Mobile",
        realProps: realdevices.iPhone_XR
    },
    {
        resolution: "375x667",
        type: "Mobile",
        realProps: realdevices.iPhone_7
    },
    {
        resolution: "320x568",
        type: "Mobile",
        realProps: realdevices.iPhone_SE
    },
    {
        resolution: "360x740",
        type: "Mobile",
        realProps: realdevices.Galaxy_S8
    },
    //Tablet Devices
    {
        resolution: "768x1024",
        type: "Tablet",
        realProps: realdevices.iPad
    },
    {
        resolution: "1024x1366",
        type: "Tablet",
        realProps: realdevices.iPad_Pro
    },
    //Laptop Devices
    {
        resolution: "1024x600",
        type: "Laptop",
        realProps: null
    },
    {
        resolution: "1024x768",
        type: "Laptop",
        realProps: null
    },
    {
        resolution: "1280x800",
        type: "Laptop",
        realProps: null
    },
    {
        resolution: "1366x768",
        type: "Laptop",
        realProps: null
    },
    {
        resolution: "1440x900",
        type: "Laptop",
        realProps: null
    },
    {
        resolution: "1600x900",
        type: "Laptop",
        realProps: null
    },
    {
        resolution: "1536x864",
        type: "Laptop",
        realProps: null
    },
    //Large Screen
    {
        resolution: "1920x1080",
        type: "Largescreens",
        realProps: null
    },
    {
        resolution: "2560x1440",
        type: "Largescreens",
        realProps: null
    }
];

module.exports = {
    devices: deviceprops
}