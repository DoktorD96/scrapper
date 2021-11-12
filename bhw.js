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
const outputpath = "blackhatworld.com";


//# CUSTOM MODULES
const config = require('./custom_modules/configall.js');
const devices = require('./custom_modules/devicehelper.js');
const helper = require('./custom_modules/helper.js');
const jquery = require('./custom_modules/jquery.js');
const logger = require('./custom_modules/logger.js');

//# PATHS

var ROOT = path.resolve(__dirname, '..');
var CODE = path.resolve(__dirname, '../CODE');
var CONFIG = path.resolve(__dirname, '../CONFIG');
var OUTPUT = path.resolve(__dirname, '../OUTPUT');


const customconfig = require(`${CONFIG}\\bhw.js`);
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
                    search: `${questions[i]} ${keywords[j]}`,
                    key: keywords[j]
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
            search: `https://www.blackhatworld.com/search/?q=${encodeURIComponent(searchterms[i].search)}&o=date`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.blackhatworld.com/search/?q=${encodeURIComponent(searchterms[i].search)}&o=relevance`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.blackhatworld.com/search/?q=${encodeURIComponent(searchterms[i].search)}&c[title_only]=1&o=date`,
            key: searchterms[i].key
        });
        urls.push({
            search: `https://www.blackhatworld.com/search/?q=${encodeURIComponent(searchterms[i].search)}&c[title_only]=1&o=relevance`,
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
    for (var i = 0; i < urls.length; i++) {
        try {

            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await client.send('Network.setCacheDisabled', {
                cacheDisabled: true,
            });

            await page.goto(urls[i].search, { waitUntil: 'networkidle2' });

            await page.waitForSelector(`button[type="submit"]`);
            var submit = await page.$$(`button[type="submit"]`);
            await submit[1].click();
            //await page.click(`button[type="submit"]`);
            await page.evaluate(() => { //fallback
                try {
                    document.querySelectorAll(`button[type="submit"]`)[1].click();
                    document.querySelectorAll(`button[type="submit"]`)[1].click();

                } catch (e) {}

                try {
                    document.querySelectorAll(`form`)[1].submit();
                    document.querySelectorAll(`form`)[1].submit();

                } catch (e) {}


            });

            await helper.sleep(5);
            await page.waitForSelector(`body[data-template="search_results"]`);


            var result = await page.evaluate(body => body.innerHTML, await page.$('body'));
            var $ = cherrio.load(result);
            var noresults = $(`div.blockMessage`).text().toLowerCase().indexOf(`no results found`);
            if (noresults > -1) {
                logger.warn(`No results on page`);
            }

            var number = parseInt($(`nav.pageNavWrapper li.pageNav-page:last`).text());

            if (noresults == -1 && number > 0) {
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

        console.log(urlswithpages[i].url);
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');
        await client.send('Network.setCacheDisabled', {
            cacheDisabled: true,
        });

        await page.goto(urlswithpages[i].url, { waitUntil: 'networkidle2' });
        var checkQuestionfor = urlswithpages[i].key;
        var globalURL = "";
        for (var j = 0, l1 = urlswithpages[i].pages; j < l1; j++) {

            var filename = getFileName(urlswithpages[i].key);
            filename = filename + "_" + outputpath;
            var allrawdata = `${OUTPUT}\\${outputpath}\\${filename}[raw].txt`;
            var detectedquestion = `${OUTPUT}\\${outputpath}\\${filename}[ques].txt`;
            var allinks = `${OUTPUT}\\${outputpath}\\${filename}[links].txt`;
            fs.ensureFileSync(allrawdata);
            fs.ensureFileSync(detectedquestion);
            fs.ensureFileSync(allinks);
            var write_allrawdata = fs.createWriteStream(allrawdata, { flags: 'a' });
            var write_detectedquestion = fs.createWriteStream(detectedquestion, { flags: 'a' });
            var write_allinks = fs.createWriteStream(allinks, { flags: 'a' });

            try {
                if (j === 0) {

                    await page.goto(urls[i].search, { waitUntil: 'networkidle2' });

                    await page.waitForSelector(`button[type="submit"]`);
                    var submit = await page.$$(`button[type="submit"]`);
                    await submit[1].click();
                    //await page.click(`button[type="submit"]`);
                    await page.evaluate(() => { //fallback
                        try {
                            document.querySelectorAll(`button[type="submit"]`)[1].click();
                            document.querySelectorAll(`button[type="submit"]`)[1].click();

                        } catch (e) {}

                        try {
                            document.querySelectorAll(`form`)[1].submit();
                            document.querySelectorAll(`form`)[1].submit();

                        } catch (e) {}


                    });

                    await helper.sleep(5);
                    await page.waitForSelector(`body[data-template="search_results"]`);


                    globalURL = await page.evaluate(() => { //fallback
                        try {
                            return window.location.href;

                        } catch (e) {
                            return "";
                        }
                    });

                } else {
                    console.log(`${globalURL}&page=${(j + 1)}`);
                    await page.goto(`${globalURL}&page=${(j + 1)}`, { waitUntil: 'networkidle2' });
                    await helper.sleep(5);
                    await page.waitForSelector(`body[data-template="search_results"]`);
                }


                const result = await page.evaluate(body => body.innerHTML, await page.$('body'));
                const $ = cherrio.load(result);


                var questionsDetected = [];
                $(`div.contentRow`).each(function() {
                    try {
                        if ($(this).find('a').text().trim().length > 10) {
                            let o = {}

                            o.TITLE = ""; //placeholder
                            o.TEXT = ""; //placeholder
                            o.HREF = ""; //placeholder


                            // format title properly
                            try {
                                o.TITLE = $(this).find('h3.contentRow-title').text().trim();
                                o.TITLE = o.TITLE.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                                o.TITLE = o.TITLE.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                                o.TITLE = o.TITLE.replace(/("|“|”)/gm, "");
                            } catch (e) {}

                            // format text properly 
                            try {
                                o.TEXT = $(this).find('div.contentRow-snippet').text().trim();
                                o.TEXT = o.TEXT.replace(/(\r\n|\n|\r|\t|\f|\v|\v |<br>|<br\/>|<BR>|<BR\/>)/gm, " ");
                                o.TEXT = o.TEXT.replace(/(·|—|—”|—"|—“|—')/gm, ".");
                                o.TEXT = o.TEXT.replace(/("|“|”)/gm, "");
                            } catch (e) {}

                            // format link properly
                            try {
                                o.HREF = $(this).find('h3.contentRow-title a').attr('href').trim();
                            } catch (e) {}

                            // Add links to links folder
                            try {
                                if (o.HREF.trim().length > 0) {
                                    write_allinks.write(`https://www.blackhatworld.com${o.HREF}\r\n`);
                                }
                            } catch (e) {}

                            // Add all raw data
                            try {

                                write_allrawdata.write(`\r\n\r\n${o.TITLE}\r\n`);
                                write_allrawdata.write(`${o.TEXT}\r\n`);
                                write_allrawdata.write(`https://www.blackhatworld.com${o.HREF}\r\n`);

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

        await helper.sleep(5);
    }
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