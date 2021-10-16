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

/*
[
detectedquestion.txt //All detected questions with removed duplicates.
possiblequestions.txt // all sentences that qualify for questions but don't have ? sign
allrawdata.txt
allinks.txt
]
*/

/*
    customconfig.c2captchaApiKey: "22bc2ed421bf61bae2c5c68962015fd0",
    customconfig.cAntiCaptchaApiKey: "46ed188b494d6d6af5d3023c4ecabeea",
    customconfig.websiteKey: "6Lfmm70ZAAAAADvPzM6OhZ8Adi40-78E-aYfc1ZS",
    customconfig.captchaprovider
*/

var c2captcha = (pageurl) => {
    return new Promise(async function(resolve) {
        var senddata = "";
        senddata = senddata + `key=${encodeURIComponent("22bc2ed421bf61bae2c5c68962015fd0")}`;
        senddata = senddata + `&method=${encodeURIComponent("userrecaptcha")}`;
        senddata = senddata + `&googlekey=${encodeURIComponent("6Lfmm70ZAAAAADvPzM6OhZ8Adi40-78E-aYfc1ZS")}`;
        senddata = senddata + `&pageurl=${encodeURIComponent(pageurl)}`;
        senddata = senddata + `&json=${encodeURIComponent("1")}`;
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
                    axiosdata.proxy = proxydetails;

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
            console.log(response.data);
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
        senddata = senddata + `key=${encodeURIComponent("22bc2ed421bf61bae2c5c68962015fd0")}`;
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
                if (data.status == 0 && data.request.toLowerCase().trim() == "capcha_not_ready") {
                    resolve("waiting");
                    return false;
                }
                if (data.status == 1 && data.request.length > 70) {
                    resolve(data.request.trim());
                    return false;
                } else {
                    errorfunc("No request param provided on response");
                    resolve("error");
                    return false;
                }
            } catch (error) {
                errorfunc("1." + error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc("2." + error.message);
            resolve("error");
            return false;
        });
    });
}

var c2captchabalance = (pageurl) => {
    return new Promise(async function(resolve) {
        var senddata = "";
        senddata = senddata + `key=${encodeURIComponent("22bc2ed421bf61bae2c5c68962015fd0")}`;
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
                errorfunc("1." + error.message);
                resolve("error");
                return false;
            }
        }).catch(function(error) {
            errorfunc("2." + error.message);
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

const captchaDetected = (numRetry) => {
    /*
    const spanVal =  await page.$eval('.target-holder .target', el => el.innerText);
    let element = await page.$('your selector')
    let value = await page.evaluate(el => el.textContent, element)
    let value = await element.evaluate(el => el.textContent)
    */

    /*
"https://api.wit.ai/*",
"https://speech.googleapis.com/*",
"https://*.speech-to-text.watson.cloud.ibm.com/*",
"https://*.stt.speech.microsoft.com/*"
 
*/


    return new Promise(async function(resolve) {
        try {

            await helper.sleep(5);
            var isC = await isCaptcha();

            if (!isC) {
                resolve(true);
            } else {
                logger.warn("Captcha detected");
                var MAX_RETRIES = 4;
                for (var i = 0, l = MAX_RETRIES; i < l; i++) {
                    var c2worker = await c2captchaworker(isC.url);
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
                    //captcha is solved with proper response

                    console.log(c2worker);
                    //await helper.sleep(999999);
                    await page.evaluate(({ c2worker }) => {
                        try {
                            document.getElementById("g-recaptcha-response").innerHTML = c2worker;
                        } catch (e) {}
                        try {
                            document.querySelector(`textarea[name="g-recaptcha-response"]`).innerHTML = c2worker;
                        } catch (e) {}
                        try {
                            $('#nocaptcha-form').submit();
                        } catch (e) {}
                        try {
                            document.querySelectorAll(`form`)[1].submit();
                        } catch (e) {}
                    }, { c2worker });
                    await helper.sleep(999999);
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

    const allrawdata = `${config.server.server.output}\\${outputpath}\\allrawdata.txt`;
    const detectedquestion = `${config.server.server.output}\\${outputpath}\\detectedquestion.txt`;
    //const possiblequestions = `${config.server.server.output}\\${outputpath}\\possiblequestions.txt`;
    const allinks = `${config.server.server.output}\\${outputpath}\\allinks.txt`;


    fs.ensureFileSync(allrawdata);
    fs.ensureFileSync(detectedquestion);
    //fs.ensureFileSync(possiblequestions);
    fs.ensureFileSync(allinks);



    const write_allrawdata = fs.createWriteStream(allrawdata, { flags: 'a' });
    const write_detectedquestion = fs.createWriteStream(detectedquestion, { flags: 'a' });
    //const write_possiblequestions = fs.createWriteStream(possiblequestions, { flags: 'a' });
    const write_allinks = fs.createWriteStream(allinks, { flags: 'a' });


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
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
    )
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



            await page.goto(`${urls[i].search}&num=50`, { waitUntil: 'networkidle2' });
            await page.waitForSelector(`body`);
            var captchaSolved = false;
            /*for (var i = 0, l = 3; captchaSolved == true || i < l; i++) {
                var captchaSolved = await captchaDetected();
                if(i)
            }*/
            captchaSolved = await captchaDetected();
            if (captchaSolved == false) {
                errorfunc(`Captcha can't be solved.`);
                return false;
            }

            var result = await page.evaluate(body => body.innerHTML, await page.$('body'));
            var $ = cherrio.load(result);
            var number = parseInt($(`div.pager span.page-numbers:last`).text());

            if (number > 0) {
                logger.info(`${number} pages found`);
                urlswithpages.push({ pages: number, url: urls[i].search, key: urls[i].key });
            }

        } catch (e) {
            errorfunc(e.message);
            return false;
        }
    }

    await helper.sleep(5);
    console.clear();
    logger.info(`Generating urls with pages`);

    await helper.sleep(5);


    console.clear();
    console.log(`${logger.colors.e1.brGreen}Generated${logger.colors.e1.reset} ${logger.colors.e1.brBlue} ALL URLS${logger.colors.e1.reset}`);

    await helper.sleep(7);



    for (var i = 0, l = urlswithpages.length; i < l; i++) {
        //finalurls
        for (var k = 0, l3 = urlswithpages[i].pages; k < l3; k++) {
            try {
                console.log(`${urlswithpages[i].url}&page=${(k + 1)}&pagesize=50`);
                // await client.send('Network.clearBrowserCookies');
                // await client.send('Network.clearBrowserCache');
                // await client.send('Network.setCacheDisabled', {
                //     cacheDisabled: true,
                // });

                var checkQuestionfor = urlswithpages[i].key;

                await page.goto(`${urlswithpages[i].url}&page=${(k + 1)}&pagesize=50`, { waitUntil: 'networkidle2' });
                await page.waitForSelector(`body`);
                var captchaSolved = false;
                /*for (var i = 0, l = 3; captchaSolved == true || i < l; i++) {
                    var captchaSolved = await captchaDetected();
                    if(i)
                }*/
                captchaSolved = await captchaDetected();
                if (captchaSolved == false) {
                    errorfunc(`Captcha can't be solved.`);
                    return false;
                }

                const result = await page.evaluate(body => body.innerHTML, await page.$('body'));
                const $ = cherrio.load(result);
                await captchaDetected($);





                var questionsDetected = [];
                $(`div.question.search-result`).each(function() {
                    try {
                        if ($(this).find('a').first().text().trim().length > 10) {
                            let o = {}

                            o.TITLE = ""; //placeholder
                            o.TEXT = ""; //placeholder
                            o.HREF = ""; //placeholder


                            // format title properly
                            try {
                                o.TITLE = $(this).find('a').first().text().trim();
                                o.TITLE = o.TITLE.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                                o.TITLE = o.TITLE.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                                o.TITLE = o.TITLE.replace(/("|“|”)/gm, "");
                            } catch (e) {}

                            // format text properly 
                            try {
                                o.TEXT = $(this).find(`div.excerpt`).text().trim();

                                if (o.TEXT.indexOf("—") > -1 && o.TEXT.indexOf("—") < 25) {
                                    o.TEXT = o.TEXT.substr(o.TEXT.indexOf("—") + 1);
                                }
                                o.TEXT = o.TEXT.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                                o.TEXT = o.TEXT.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                                o.TEXT = o.TEXT.replace(/("|“|”)/gm, "");
                            } catch (e) {}

                            // format link properly
                            try {
                                o.HREF = $(this).find('a').first().attr('href').trim();
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


                            // match lowercase strinf str.replace(str.charAt(0), "");
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


}
//testing();