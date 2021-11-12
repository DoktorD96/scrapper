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
const outputpath = "reddit.com";


//# CUSTOM MODULES
const config = require('./custom_modules/configall.js');
const devices = require('./custom_modules/devicehelper.js');
const helper = require('./custom_modules/helper.js');
const jquery = require('./custom_modules/jquery.js');
const logger = require('./custom_modules/logger.js');
const customconfig = require(`${config.server.server.config}\\reditt.js`);
var checkQuestionfor = "";
var questionsDetected = [];
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

const errorfunc = async(message) => {
    try {
        logger.errorlog(message);
        await page.close();
        await browser.close();
    } catch (e) {}
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
                    search: `${questions[i]}  ${keywords[j]}`,
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
            search: `https://www.reddit.com/search/?q=${encodeURIComponent(searchterms[i].search)}&type=link&sort=relevance`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.reddit.com/search/?q=${encodeURIComponent(searchterms[i].search)}&type=link&sort=comments`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.reddit.com/search/?q=${encodeURIComponent(searchterms[i].search)}&type=link&sort=new`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.reddit.com/search/?q=${encodeURIComponent(searchterms[i].search)}&type=link&sort=hot`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.reddit.com/search/?q=${encodeURIComponent(searchterms[i].search)}&type=link&sort=top`,
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


    browser = await puppeteer.launch(puppeterdataconfig);
    [page] = await browser.pages();


    if (customconfig.proxyenabled.toLowerCase().trim().indexOf("true") > -1) {
        try {
            if (customconfig.p_username.trim().length > 0 && customconfig.p_pass.trim().length > 0) {
                await page.authenticate({
                    username: customconfig.p_username.trim(),
                    password: customconfig.p_pass.trim()
                });
            } else {
                logger.error(`Invalid proxy settings.`);
                return false;
            }
        } catch (e) {
            logger.error(`Invalid proxy settings.`);
            return false;
        }
    }
    await page.evaluateOnNewDocument(helper.headlessdetect);
    await page.setUserAgent(USER_AGENT);
    await page.setCacheEnabled(false);
    await page.setDefaultTimeout(120000);
    var client = await page.target().createCDPSession();
    await helper.sleep(5);
    console.clear();

    console.clear();
    console.log(`${logger.colors.e1.brGreen}Generated${logger.colors.e1.reset} ${logger.colors.e1.brBlue} ALL URLS${logger.colors.e1.reset}`);

    await helper.sleep(7);
    console.clear();
    var nodelogmsg = function(msgdata) {
        for (var i2 = 0, l2 = msgdata.length; i2 < l2; i2++) {
            try {
                if (msgdata[i2].title.length > -1 && msgdata[i2].text.length > -1 && msgdata[i2].link.length > -1) {

                    var o = {};
                    o.TITLE = ""; //placeholder
                    o.TEXT = ""; //placeholder
                    o.HREF = ""; //placeholder


                    // format title properly
                    try {
                        o.TITLE = msgdata[i2].title;
                        o.TITLE = o.TITLE.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                        o.TITLE = o.TITLE.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                        o.TITLE = o.TITLE.replace(/("|“|”)/gm, "");
                    } catch (e) {}
                    o.HREF = `https://www.reddit.com${msgdata[i2].link}`;
                    o.TEXT = msgdata[i2].text;
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
            } catch (err) {

            }
        }
        try {
            if (questionsDetected.length > 0) {
                questionsDetected = [...new Set(questionsDetected)];
                logger.success(`New questions detected. Added.`);
            }
            for (let i = 0, l = questionsDetected.length; i < l; i++) {
                write_detectedquestion.write(`${questionsDetected[i]}\r\n`);

            }
            questionsDetected = [];
        } catch (e) {}
    }

    for (var i = 0, l = urls.length; i < l; i++) {

        var filename = getFileName(urls[i].key);
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

        console.clear();
        try {
            console.log(urls[i].search);
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await client.send('Network.setCacheDisabled', {
                cacheDisabled: true,
            });

            checkQuestionfor = urls[i].key;

            await page.goto(urls[i].search, { waitUntil: 'networkidle2' });
            try {
                await page.exposeFunction("nodeLog", nodelogmsg);
            } catch (e) {}
            await helper.sleep(7);
            await page.waitForSelector(`body`);

            var noresults = await page.evaluate(() => {
                try {
                    if (document.querySelectorAll(`div[data-testid="no-results"]`).length > 0) {
                        return true;
                    }
                } catch (e) {
                    return true;
                }
                return false;
            });

            if (noresults) {
                logger.warn("No results on the page. Page skipped.");
                await helper.sleep(10);
                continue;
            }
            var jcode = jquery.jcode;

            await page.evaluate(({ jcode }) => {
                var jq = document.createElement("script");
                jq.type = "text/javascript";
                jq.text = jcode;
                document.getElementsByTagName("head")[0].appendChild(jq);
            }, { jcode });

            questionsDetected = [];

            await page.evaluate(({}) => {


                function remove_scrapped_elements() {
                    var data1 = $(`div[data-testid="post-container"][scrapped]`);
                    if (data1.length > 400) {
                        data1.slice(0, 350).remove();
                    }
                }

                setInterval(() => {
                    var senddata = [];
                    var data1 = $(`div[data-testid="post-container"]:not([scrapped])`);
                    console.log(data1);

                    if (data1.length > 0) {

                        for (var i = 0, l = parseInt(data1.length); i < l; i++) {
                            try {
                                data1[i].setAttribute("scrapped", "true");
                                var title = $(data1[i]).find(`a[href][data-click-id="body"]:first`).text().trim();
                                var link = $(data1[i]).find(`a[href][data-click-id="body"]:first`).attr("href").trim();
                                var text = "";
                                try {
                                    var time = $(data1[i]).find(`a[data-click-id="timestamp"]:first`).text().trim();
                                    var comm = $(data1[i]).find(`a[data-click-id="comments"]:first`).text().trim();
                                    comm = comm.toLowerCase().replace(`comment`).replace(`s`);
                                    comm = parseInt(comm) > 0 ? parseInt(comm) : 0;
                                    text = `TIME: ${time} COMMENTS: ${comm}`
                                } catch (e) {}
                                if (title.length > 10 && link.length > 10) {
                                    senddata.push({ title: title, link: link, text: text });
                                }

                            } catch (e) {}
                        }
                    }
                    remove_scrapped_elements();
                    nodeLog(senddata);
                }, 25000); //0.5min

                setInterval(() => {
                    window.scrollTo(0, 9e30);
                }, 5000); //5 sec
            }, {});
            await helper.sleep(180); // 3 min per keyword
        } catch (error) {
            errorfunc(error.message);
            return false;
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