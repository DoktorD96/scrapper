//# REQUIRED MODULES
const cherrio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());
var browser = null;
var page = null;
const fs = require('fs-extra');
const path = require('path');
const outputpath = "stackexchange.com";
const axios = require('axios');
const axiosRetry = require('axios-retry');
axiosRetry(axios, { retries: 3 });

//# CUSTOM MODULES
const config = require('./custom_modules/configall.js');
const devices = require('./custom_modules/devicehelper.js');
const helper = require('./custom_modules/helper.js');
const jquery = require('./custom_modules/jquery.js');
const logger = require('./custom_modules/logger.js');
const { resolve } = require('path');
const customconfig = require(`${config.server.server.config}\\stack.js`);
var USER_AGENT = customconfig.useragent;



const getFileName = (searhterm) => {
    try {
        searhterm = searhterm.trim()
        var date = new Date();
        var filename = searhterm.toLowerCase().replace(/(<|>|:|\"|\'|\\|\/|\||\?>|\*|\=|\&|;|)/gmi, "");
        filename = filename.replace(/\s/gmi, "_")
        return filename;
    } catch (e) {
        return "";
    }

}
var c2captcha = (pageurl) => {
    return new Promise(async function(resolve) {
        var senddata = "";
        senddata = senddata + `key=${encodeURIComponent(customconfig.c2captchaApiKey.trim())}`;
        senddata = senddata + `&method=${encodeURIComponent("userrecaptcha")}`;
        senddata = senddata + `&googlekey=${encodeURIComponent(customconfig.websiteKey.trim())}`;
        senddata = senddata + `&pageurl=${encodeURIComponent(pageurl)}`;
        senddata = senddata + `&json=${encodeURIComponent("1")}`;
        senddata = senddata + `&userAgent=${encodeURIComponent(USER_AGENT)}`;

        try {
            if (customconfig.captchasendproxy.toLowerCase().trim().indexOf("true") > -1 &&
                customconfig.proxyenabled.toLowerCase().trim().indexOf("true") > -1) {
                var proxydetails = "";
                if (customconfig.p_username.trim().length > 0) {
                    proxydetails = proxydetails + customconfig.p_username.trim() + ":";
                } else {
                    errorfunc(`Invalid proxy settings.`);
                    resolve("error");
                    return false;
                }
                if (customconfig.p_pass.trim().length > 0) {
                    proxydetails = proxydetails + customconfig.p_pass.trim() + "@";
                } else {
                    errorfunc(`Invalid proxy settings.`);
                    resolve("error");
                    return false;
                }


                if (customconfig.proxy.trim().length > 7) {
                    var captchaproxy = customconfig.proxy.toLowerCase().trim();
                    if (captchaproxy.indexOf("http://") > -1) {
                        captchaproxy = captchaproxy.replace("http://", "");
                    }
                    if (captchaproxy.indexOf("https://") > -1) {
                        captchaproxy = captchaproxy.replace("https://", "");
                    }

                    var ip = captchaproxy.split(":")[0];
                    var port = captchaproxy.split(":")[1];

                    proxydetails = proxydetails + ip + ":" + port;

                    senddata = senddata + `&proxy=${encodeURIComponent(proxydetails)}`;

                } else {
                    errorfunc(`Invalid proxy settings.`);
                    resolve("error");
                    return false;
                }

            }
        } catch (e) {
            errorfunc(`Invalid proxy settings.`);
            resolve("error");
            return false;
        }

        await axios.request({
            method: 'POST',
            url: 'https://2captcha.com/in.php',
            //responseType: 'arraybuffer', //radi convert to after
            //transformResponse: (data) => { return data; },//works
            //transformResponse:[function (data) {return data;}] //works
            //transformResponse: null //works
            //transformResponse: [], //works
            transformResponse: null,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: senddata
        }).then(function(response) {
            try {
                var data = JSON.parse(response.data.toLowerCase().trim());
                if (data.status == 1 && data.request.length > 3) {
                    resolve(data.request.trim());
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc(error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc(error.message);
            resolve("error");
            return false;
        });
    });
}


var c2captcharesponse = (workerid) => {
    return new Promise(async function(resolve) {
        var senddata = "";
        senddata = senddata + `key=${encodeURIComponent(customconfig.c2captchaApiKey.trim())}`;
        senddata = senddata + `&action=${encodeURIComponent("get")}`;
        senddata = senddata + `&id=${encodeURIComponent(workerid)}`;
        senddata = senddata + `&json=${encodeURIComponent("1")}`;
        await axios.request({
            method: 'POST',
            url: 'https://2captcha.com/res.php',
            transformResponse: null,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: senddata
        }).then(function(response) {
            try {
                var data = JSON.parse(response.data.toLowerCase().trim());
                var data1 = JSON.parse(response.data.trim());
                if (data.status == 0 && data.request.toLowerCase().trim() == "capcha_not_ready") {
                    resolve("waiting");
                    return false;
                }
                if (data.status == 1 && data.request.length > 70) {
                    resolve(data1.request.trim());
                    return false;
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc(error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc(error.message);
            resolve("error");
            return false;
        });
    });
}

var c2captchabalance = (pageurl) => {
    return new Promise(async function(resolve) {
        var senddata = "";
        senddata = senddata + `key=${encodeURIComponent(customconfig.c2captchaApiKey.trim())}`;
        senddata = senddata + `&action=${encodeURIComponent("getbalance")}`;
        senddata = senddata + `&json=${encodeURIComponent("1")}`;
        await axios.request({
            method: 'POST',
            url: 'https://2captcha.com/res.php',
            transformResponse: null,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: senddata
        }).then(function(response) {
            try {
                var data = JSON.parse(response.data.toLowerCase().trim());
                if (data.status == 1 && data.request.length > 0) {
                    resolve(data.request.trim());
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc(error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc(error.message);
            resolve("error");
            return false;
        });
    });
}

var c2captchaworker = (pageurl) => {
    return new Promise(async function(resolve) {
        if (parseFloat(await c2captchabalance()) < 1) {
            errorfunc("No enough 2Captcha Balance. Add balance");
            resolve("no_balance");
            return false;
        }
        var jobid = await c2captcha(pageurl);
        await helper.sleep(30);
        var solvedcaptcha = await c2captcharesponse(jobid);
        if (solvedcaptcha == "waiting") {
            await helper.sleep(30);
            solvedcaptcha = await c2captcharesponse(jobid);
        }
        if (solvedcaptcha == "waiting") {
            await helper.sleep(30);
            solvedcaptcha = await c2captcharesponse(jobid);
        }
        if (solvedcaptcha == "waiting") {
            await helper.sleep(30);
            solvedcaptcha = await c2captcharesponse(jobid);
        }

        if (solvedcaptcha.length > 70) {
            resolve(solvedcaptcha);
            return false;
        } else {
            logger.error("2captcha solving failed.");
            resolve("error");
            return false;
        }
    });
}

var anticaptcha = (pageurl) => {
    return new Promise(async function(resolve) {

        var senddata = {};
        senddata.clientKey = customconfig.cAntiCaptchaApiKey.trim();
        senddata.task = {};
        senddata.task.websiteURL = pageurl;
        senddata.task.websiteKey = customconfig.websiteKey.trim();
        senddata.task.type = "RecaptchaV2TaskProxyless";

        try {
            if (customconfig.captchasendproxy.toLowerCase().trim().indexOf("true") > -1 &&
                customconfig.proxyenabled.toLowerCase().trim().indexOf("true") > -1) {

                if (customconfig.p_username.trim().length > 0) {

                } else {
                    errorfunc(`Invalid proxy settings.`);
                    resolve("error");
                    return false;
                }
                if (customconfig.p_pass.trim().length > 0) {

                } else {
                    errorfunc(`Invalid proxy settings.`);
                    resolve("error");
                    return false;
                }

                if (customconfig.proxy.trim().length > 7) {
                    var captchaproxy = customconfig.proxy.toLowerCase().trim();
                    if (captchaproxy.indexOf("http://") > -1) {
                        captchaproxy = captchaproxy.replace("http://", "");
                    }
                    if (captchaproxy.indexOf("https://") > -1) {
                        captchaproxy = captchaproxy.replace("https://", "");
                    }

                    var ip = captchaproxy.split(":")[0];
                    var port = captchaproxy.split(":")[1];


                    senddata.task.websiteURL = pageurl;
                    senddata.task.proxyType = "http";
                    senddata.task.websiteKey = customconfig.websiteKey.trim();
                    senddata.task.type = "RecaptchaV2Task";

                    senddata.task.proxyAddress = ip;
                    senddata.task.proxyPort = port;
                    senddata.task.proxyLogin = customconfig.p_username.trim();
                    senddata.task.proxyPassword = customconfig.p_pass.trim();
                    senddata.task.userAgent = USER_AGENT;


                } else {
                    errorfunc(`Invalid proxy settings.`);
                    resolve("error");
                    return false;
                }

            }
        } catch (e) {
            errorfunc(`Invalid proxy settings.`);
            resolve("error");
            return false;
        }

        await axios.request({
            method: 'POST',
            url: 'https://api.anti-captcha.com/createTask',
            transformResponse: null,
            headers: { "Content-Type": "application-json" },
            data: JSON.stringify(senddata)
        }).then(function(response) {
            try {
                var data = JSON.parse(response.data.toLowerCase().trim());
                if (data.errorid == 0 && data.taskid.toString().length > 3) {
                    resolve(data.taskid.toString().trim());
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc(error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc(error.message);
            resolve("error");
            return false;
        });
    });
}


var anticresponse = (workerid) => {
    return new Promise(async function(resolve) {
        var senddata = `{"clientKey":"${customconfig.cAntiCaptchaApiKey.trim()}","taskId":${workerid.trim()}}`;
        await axios.request({
            method: 'POST',
            url: 'https://api.anti-captcha.com/getTaskResult',
            transformResponse: null,
            headers: { "Content-Type": "application-json" },
            data: senddata
        }).then(function(response) {
            try {
                var data = JSON.parse(response.data.toLowerCase().trim());
                var data1 = JSON.parse(response.data.trim());
                if (data.status != null && data.status.trim() == "processing") {
                    resolve("waiting");
                    return false;
                }
                if (data.status != null && data.status.trim() == "ready") {
                    resolve(data1.solution.gRecaptchaResponse.trim());
                    return false;
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc(error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc(error.message);
            resolve("error");
            return false;
        });
    });
}

var anticbalance = (pageurl) => {
    return new Promise(async function(resolve) {
        var senddata = {};
        senddata.clientKey = customconfig.cAntiCaptchaApiKey.trim();
        await axios.request({
            method: 'POST',
            url: 'https://api.anti-captcha.com/getBalance',
            transformResponse: null,
            headers: { "Content-Type": "application-json" },
            data: JSON.stringify(senddata)
        }).then(function(response) {
            try {
                var data = JSON.parse(response.data.toLowerCase().trim());
                if (data.errorid == 0 && data.balance > 0) {
                    resolve(data.balance.toString());
                    return false;
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc(error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc(error.message);
            resolve("error");
            return false;
        });
    });
}

var anticworker = (pageurl) => {
    return new Promise(async function(resolve) {
        if (parseFloat(await anticbalance()) < 1) {
            errorfunc("No enough AntiCaptcha Balance. Add balance");
            resolve("no_balance");
            return false;
        }
        var jobid = await anticaptcha(pageurl);
        await helper.sleep(30);
        var solvedcaptcha = await anticresponse(jobid);
        if (solvedcaptcha == "waiting") {
            await helper.sleep(30);
            solvedcaptcha = await anticresponse(jobid);
        }
        if (solvedcaptcha == "waiting") {
            await helper.sleep(30);
            solvedcaptcha = await anticresponse(jobid);
        }
        if (solvedcaptcha == "waiting") {
            await helper.sleep(30);
            solvedcaptcha = await anticresponse(jobid);
        }

        if (solvedcaptcha.length > 70) {
            resolve(solvedcaptcha);
            return false;
        } else {
            logger.error("AntiCaptcha solving failed.");
            resolve("error");
            return false;
        }
    });
}

const errorfunc = async(message) => {
    try {
        logger.errorlog(message);
        await page.close();
        await browser.close();
    } catch (e) {}
}

const isCaptcha = () => {
    return new Promise(async function(resolve) {
        try {
            var url = await page.evaluate(() => {
                try {
                    return window.location.href;
                } catch (e) {
                    return "";
                }
            });
            var title = await page.evaluate(() => {
                try {
                    return document.querySelector(`title`).innerHTML.trim().toLowerCase();
                } catch (e) {
                    return "";
                }
            });
            var recaptcha = await page.evaluate(() => {
                try {
                    return document.querySelectorAll(`iframe[title="reCAPTCHA"]`).length;
                } catch (e) {
                    return 0;
                }

            });

            var captchaDetected = false;

            if (captchaDetected == false && url.toLowerCase().indexOf(`https://stackexchange.com/nocaptcha`) === 0) {
                captchaDetected = true;

            }
            if (captchaDetected == false && title === "human verification") {
                captchaDetected = true;

            }
            if (captchaDetected == false && recaptcha > 0) {
                captchaDetected = true;

            }
            if (captchaDetected == true && recaptcha == 0) {
                errorfunc(`Error: Captcha provider is not Recaptcha.`);
                resolve(false);
                return;
            }

            if (captchaDetected == false) {
                resolve(false);
            } else {
                resolve({ url: url });
            }
        } catch (error) {
            errorfunc(`Error: Error while detecting captcha.`);
            resolve(false);
        }
    });
}

const captchaDetected = () => {
    return new Promise(async function(resolve) {
        try {

            await helper.sleep(5);
            var isC = await isCaptcha();
            // var isC = true;
            if (!isC) {
                resolve(true);
                return false;
            } else {
                logger.warn("Captcha detected");
                var MAX_RETRIES = 4;
                for (var i = 0, l = MAX_RETRIES; i < l; i++) {

                    var isC = await isCaptcha();
                    // var isC = true;
                    if (!isC) {
                        resolve(true);
                        return false;
                    }
                    try {
                        if (customconfig.captchaprovider.trim().toLowerCase().indexOf(`2captcha`) > -1) {
                            var c2worker = await c2captchaworker(isC.url);
                        } else if (customconfig.captchaprovider.trim().toLowerCase().indexOf(`anticaptcha`) > -1) {
                            var c2worker = await anticworker(isC.url);
                        } else {
                            errorfunc(`No proper captcha defined '2captcha' | 'anticaptcha' `);
                            resolve(false);
                            return;
                        }
                    } catch (e) {
                        errorfunc(`No proper captcha defined '2captcha' | 'anticaptcha' `);
                        resolve(false);
                        return;
                    }



                    if (c2worker == "no_balance") {
                        errorfunc("2captcha no enough balance");
                        resolve(false);
                        return;
                    }
                    if (c2worker == "error" && i == (MAX_RETRIES - 1)) {
                        errorfunc("Captcha solving failed besides multiple try.");
                        resolve(false);
                        return;
                    }
                    if (c2worker == "error") {
                        logger.error("Captcha failed, retrying.");
                        await page.reload({ waitUntil: 'networkidle2' });
                        await helper.sleep(5);
                    }
                    var client = await page.target().createCDPSession();
                    await client.send('Network.clearBrowserCookies');
                    await client.send('Network.clearBrowserCache');
                    await client.send('Network.setCacheDisabled', {
                        cacheDisabled: true,
                    });
                    await page.evaluate(({ c2worker }) => {
                        try {
                            document.getElementById("g-recaptcha-response").innerHTML = c2worker;
                        } catch (e) {}
                        try {
                            document.querySelector(`textarea[name="g-recaptcha-response"]`).innerHTML = c2worker;
                        } catch (e) {}
                        try {
                            document.getElementById("g-recaptcha-response").value = c2worker;
                        } catch (e) {}
                        try {
                            document.querySelector(`textarea[name="g-recaptcha-response"]`).value = c2worker;
                        } catch (e) {}
                        try {
                            $('#nocaptcha-form').submit();
                        } catch (e) {}
                        try {
                            document.querySelectorAll(`form`)[1].submit();
                        } catch (e) {}
                    }, { c2worker });
                    logger.success("Captcha solved.");
                    await helper.sleep(5);
                    await page.waitForSelector(`body`);
                }
            }

            //C
            //2captcha

            //anti-captcha


            //reload and call this function again

            // or do sumbit

        } catch (e) {
            errorfunc(e.message);
            resolve(false);
            return;
        }
    });
}

async function dojob() {
    var keywords = customconfig.seachterms.trim().toLowerCase();
    if (typeof keywords == null || keywords == null || keywords == "") {
        logger.error(`No valid keywords.`);
        return false;
    }
    keywords = keywords.split(",");
    try {
        if (!Array.isArray(keywords) || keywords.length < 1) {
            logger.error(`No valid keywords.`);
            return false;
        }
        for (var i = 0; i < keywords.length; i++) {
            keywords[i] = keywords[i].trim();
        }

        for (var i = keywords.length - 1; i >= 0; i--) {
            if (keywords[i].trim() == "") {
                keywords.splice(i, 1);
            }
        }

        if (keywords.length == 0) {
            logger.error(`No valid keywords.`);
            return false;
        }

    } catch (e) {
        logger.error(`No valid keywords.`);
        return false;
    }

    console.clear();
    console.log(`Keywords input:\n`);
    for (var i = 0; i < keywords.length; i++) {
        logger.info(keywords[i]);
    }

    var questions = customconfig.questions.trim().toLowerCase();
    if (typeof questions == null || questions == null || questions == "") {
        questions = [];
    } else {
        questions = questions.split(",");
    }

    try {
        if (!Array.isArray(questions) || questions.length < 1) {
            questions = [];
        } else {
            for (var i = 0; i < questions.length; i++) {
                questions[i] = questions[i].trim();
            }
            for (var i = questions.length - 1; i >= 0; i--) {
                if (questions[i].trim() == "") {
                    questions.splice(i, 1);
                }
            }
        }
    } catch (e) {
        questions = [];
    }

    if (questions.length > 0) {
        console.log(`\nQuestions input:\n`);
        for (var i = 0; i < questions.length; i++) {
            logger.info(questions[i]);
        }
        console.log(`\n`);
    }
    await helper.sleep(3);
    console.clear();
    logger.error(`Generating search URLs ... `);

    // question + search term array
    var searchterms = [];

    if (questions.length > 0) {
        for (var i = 0; i < questions.length; i++) {
            for (var j = 0; j < keywords.length; j++) {
                searchterms.push({
                    search: `${questions[i]} ${keywords[j]}`,
                    key: keywords[i]
                });
            }
        }
    } else {
        for (var i = 0; i < keywords.length; i++) {
            searchterms.push({
                search: keywords[i],
                key: keywords[i]
            });
        }
    }


    var urls = [];

    for (var i = 0; i < searchterms.length; i++) {
        urls.push({
            search: `https://stackexchange.com/search?q=${encodeURIComponent(searchterms[i].search)}&pagesize=50`,
            key: searchterms[i].key
        });
    }

    console.log(`${logger.colors.e1.brRed}Generated${logger.colors.e1.reset} ${logger.colors.e1.brBlue}${urls.length} URLS${logger.colors.e1.reset}`);

    console.log(`\n\n`);
    for (var i = 0; i < urls.length; i++) {
        logger.info(urls[i].search);
        await helper.sleep(0.3);
    }

    await helper.sleep(5);
    console.clear();


    var puppeterdataconfig = config.puppeter;
    try {
        if (customconfig.showbrowser.toLowerCase().trim().indexOf("true") > -1) {
            puppeterdataconfig.headless = false;
        } else {
            puppeterdataconfig.headless = true;
        }
        if (customconfig.proxyenabled.toLowerCase().trim().indexOf("true") > -1) {

            for (var i = puppeterdataconfig.args.length - 1; i >= 0; i--) {
                if (puppeterdataconfig.args[i].toLowerCase().trim().indexOf("proxy") > -1) {
                    puppeterdataconfig.args.splice(i, 1);
                }
            }

            if (customconfig.proxy.trim().length > 7) {
                puppeterdataconfig.args.push(`--proxy-server=${customconfig.proxy.trim()}`);
            } else {
                logger.error(`Invalid proxy settings.`);
                return false;
            }
        }

    } catch (e) {
        logger.error(`Invalid proxy settings.`);
        return false;
    }




    logger.error(`Checking number of pages for each page. \n`);

    var urlswithpages = [];
    browser = await puppeteer.launch(puppeterdataconfig);
    [page] = await browser.pages();

    var jcode = jquery.jcode;

    if (customconfig.proxyenabled.toLowerCase().trim().indexOf("true") > -1) {
        try {
            if (customconfig.p_username.trim().length > 0 && customconfig.p_pass.trim().length > 0) {
                await page.authenticate({
                    username: customconfig.p_username.trim(),
                    password: customconfig.p_pass.trim()
                });
            } else {
                errorfunc(`Invalid proxy settings.`);
                return false;
            }
        } catch (e) {
            errorfunc(`Invalid proxy settings.`);
            return false;
        }
    }
    await page.evaluateOnNewDocument(helper.headlessdetect);
    await page.setUserAgent(USER_AGENT);
    await page.setCacheEnabled(false);
    await page.setDefaultTimeout(120000);
    var client = await page.target().createCDPSession();

    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    await client.send('Network.setCacheDisabled', {
        cacheDisabled: true,
    });
    for (var i = 0; i < urls.length; i++) {
        try {
            await page.goto(urls[i].search, { waitUntil: 'networkidle2' });
            await page.waitForSelector(`body`);
            var captchaSolved = false;
            captchaSolved = await captchaDetected();
            if (captchaSolved == false) {
                errorfunc(`Captcha can't be solved.`);
                break;
                return false;
            }
            var result = await page.evaluate(body => body.innerHTML, await page.$('body'));
            var $ = cherrio.load(result);
            var numbers = $(`div.pager a`);
            var noresults = $(`p.no-results`).length;
            var max = 1;
            for (var j = 0, l = numbers.length; j < l; j++) {
                if (max < parseInt($(numbers[j]).text())) {
                    max = parseInt($(numbers[j]).text());
                }
            }
            // if one page & no results
            if (!(noresults > 0)) {
                if (max > 0) {
                    logger.info(`${max} pages found`);
                    urlswithpages.push({ pages: max, url: urls[i].search, key: urls[i].key });
                } else {
                    urlswithpages.push({ pages: 1, url: urls[i].search, key: urls[i].key });
                }
            } else {
                logger.warn("No results found.");
            }
            // if no results



        } catch (e) {
            errorfunc(e.message);
            return false;
        }
    }
    await helper.sleep(5); //5
    console.clear();
    logger.info(`Generating urls with pages`);
    await helper.sleep(5);
    console.clear();
    console.log(`${logger.colors.e1.brGreen}Generated${logger.colors.e1.reset} ${logger.colors.e1.brBlue} ALL URLS${logger.colors.e1.reset}`);
    await helper.sleep(5);



    for (var i = 0, l = urlswithpages.length; i < l; i++) {

        var filename = getFileName(urlswithpages[i].key);
        filename = filename + "_" + outputpath;
        var allrawdata = `${config.server.server.output}\\${outputpath}\\${filename}[raw].txt`;
        var detectedquestion = `${config.server.server.output}\\${outputpath}\\${filename}[ques].txt`;
        var allinks = `${config.server.server.output}\\${outputpath}\\${filename}[links].txt`;
        fs.ensureFileSync(allrawdata);
        fs.ensureFileSync(detectedquestion);
        fs.ensureFileSync(allinks);
        var write_allrawdata = fs.createWriteStream(allrawdata, { flags: 'a' });
        var write_detectedquestion = fs.createWriteStream(detectedquestion, { flags: 'a' });
        var write_allinks = fs.createWriteStream(allinks, { flags: 'a' });

        for (var k = 0, l3 = urlswithpages[i].pages; k < l3; k++) {
            try {
                console.log(`${urlswithpages[i].url}&page=${(k + 1)}`);
                var checkQuestionfor = urlswithpages[i].key;

                await page.goto(`${urlswithpages[i].url}&page=${(k + 1)}`, { waitUntil: 'networkidle2' });
                await page.waitForSelector(`body`);
                var captchaSolved = false;
                captchaSolved = await captchaDetected();
                if (captchaSolved == false) {
                    errorfunc(`Captcha can't be solved.`);
                    break;
                    return false;
                }

                const result = await page.evaluate(body => body.innerHTML, await page.$('body'));
                const $ = cherrio.load(result);





                var questionsDetected = [];
                $(`div.question.search-result`).each(function() {
                    try {
                        if ($(this).find('div.summary a').first().text().trim().length > 10) {
                            let o = {}

                            o.TITLE = ""; //placeholder
                            o.TEXT = ""; //placeholder
                            o.HREF = ""; //placeholder


                            // format title properly
                            try {
                                o.TITLE = $(this).find('div.summary a').first().text().trim();
                                o.TITLE = o.TITLE.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                                o.TITLE = o.TITLE.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                                o.TITLE = o.TITLE.replace(/("|“|”)/gm, "");
                            } catch (e) {}

                            // format text properly 
                            try {
                                o.TEXT = $(this).find(`div.summary div.excerpt`).text().trim();
                                o.TEXT = o.TEXT.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                                o.TEXT = o.TEXT.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                                o.TEXT = o.TEXT.replace(/("|“|”)/gm, "");
                            } catch (e) {}

                            // format link properly
                            try {
                                o.HREF = $(this).find('div.summary a').first().attr('href').trim();
                            } catch (e) {}

                            // Add links to links folder
                            try {
                                if (o.HREF.trim().length > 0) {
                                    write_allinks.write(`${o.HREF}\r\n`);
                                }
                            } catch (e) {}

                            // Add all raw data
                            try {

                                write_allrawdata.write(`\r\n\r\n${o.TITLE}\r\n`);
                                write_allrawdata.write(`${o.TEXT}\r\n`);
                                write_allrawdata.write(`${o.HREF}\r\n`);

                            } catch (e) {}






                            // if needed in the future to extract titles

                            var sentences = o.TITLE.match(/(.*?)(?<!Mr|Mrs|,|..."|.\,)(\.|\?|\!|\;)(?=$|(\s)|[A-Z])/gm);
                            var sentence1 = o.TEXT.match(/(.*?)(?<!Mr|Mrs|,|..."|.\,)(\.|\?|\!|\;)(?=$|(\s)|[A-Z])/gm);

                            var all = [];

                            try {
                                if (typeof sentences == null || sentences != null) {
                                    for (var i = 0, l = sentences.length; i < l; i++) {
                                        all.push(sentences[i].trim());
                                    }
                                } else {
                                    sentences = [];
                                }
                            } catch (e) { sentences = []; }
                            try {
                                if (typeof sentence1 != null || sentence1 != null) {
                                    for (var i = 0, l = sentence1.length; i < l; i++) {
                                        all.push(sentence1[i].trim());
                                    }
                                } else {
                                    sentence1 = [];
                                }
                            } catch (e) { sentence1 = []; }


                            for (var i = 0; i < all.length; i++) {
                                var keywordsBySpace = checkQuestionfor.split(" ");
                                for (var j = 0; j < keywordsBySpace.length; j++) {
                                    try {

                                        if (all[i].indexOf(`?`) > -1 // if there is question mark
                                            &&
                                            all[i].toLowerCase().indexOf(keywordsBySpace[j].trim()) > -1 // if seo, youtube egx.
                                            &&
                                            all[i].charAt(0).match(/^[A-Z]/gm) != null // if first letter is Uppercase
                                            &&
                                            all[i].charAt(all[i].length - 1) == `?` // last part of string is question
                                        ) {
                                            questionsDetected.push(all[i]);
                                        }
                                    } catch (e) {

                                    }

                                }

                            }
                        }
                    } catch (e) {
                        errorfunc(e.message);
                        return false;
                    }
                });
                if (questionsDetected.length > 0) {
                    questionsDetected = [...new Set(questionsDetected)];
                    logger.success(`New question detected. Added.`);
                }
                for (let i = 0, l = questionsDetected.length; i < l; i++) {
                    write_detectedquestion.write(`${questionsDetected[i]}\r\n`);

                }

            } catch (error) {
                errorfunc(error.message);
                return false;
            }
        }
    }
    await helper.sleep(5);

    try {
        console.clear();
        await page.close();
        await browser.close();

        logger.success(`All JOBS DONE.\nSTATUS: Scrapping complete.`);
    } catch (error) {
        errorfunc(error.message);
        return false;
    }


}

dojob();
async function testing() {
    console.log(await anticworker(`https://stackexchange.com/nocaptcha?returnUrl=%2fsearch%3fq%3dhow%2baffiliate`));
}
//testing();