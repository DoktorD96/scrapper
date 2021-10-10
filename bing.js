const cherrio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
var browser = null;
var page = null;
const fs = require('fs');
const path = require('path');
var captcha = fs.readFileSync(path.resolve(__dirname, 'tampermonkey.js'), 'utf8');
const T = require(path.resolve(__dirname, '../custom_modules/tiktok_modules.js'));
const Tesseract = require('tesseract.js');
const ObjectsToCsv = require('objects-to-csv');
const { timeStamp } = require('console');

/*


https://www.quora.com/search?q=keyword&type=question
https://www.reddit.com/search/?q=keyword
https://stackexchange.com/search?q=keyword
https://www.google.com/search?q=allintitle%3A%22how%22+AND+%22keyword%22
https://www.bing.com/search?q=intitle%3A%22how%22+AND+%22keyword%22
https://www.blackhatworld.com/search/4054608/?q=keyword&o=relevance

*/


var CONFIG = {};
CONFIG.base_url = `https://www.bing.com/search?q=`;
CONFIG.questions = ["how", "who", "where", "why", "how", "what"];
CONFIG.adjectives = ["tip", "trick", "secret", "revealed", "best", "way", "method"];
CONFIG.targets = ["affiliate", "money", "income", "passive income", "recurring income"];





var urls = [];
//var increment = 0;
for (var i = 0; i < CONFIG.questions.length; i++) {
    for (var j = 0; j < CONFIG.adjectives.length; j++) {
        for (var k = 0; k < CONFIG.targets.length; k++) {
            let url = `${CONFIG.base_url}${encodeURI(`intitle:"${CONFIG.questions[i]}"+AND+"${CONFIG.adjectives[j]}"+AND+"${CONFIG.targets[k]}"`)}`;
            urls.push(url);
        }
    }
}
var csvinsert = [];
for (let i = 0; i < urls.length; i++) {
    let msg = {
        URL: urls[i],
    };
    csvinsert.push(msg);
};
// async function dojob() {
//     const csv = new ObjectsToCsv(csvinsert);
//     await csv.toDisk(path.resolve(__dirname, 'links.csv'), { append: true });
// }
// dojob1();


var googleUrl = "https://www.google.com/search?q=allintitle:%22how%22+AND+%22tip%22+AND+%22affiliate%22";

//https://www.google.com/search?q=google+in+title+tag&start=40


//https://www.google.com/search?q=allintitle:"how"+AND+"keyword"

//  https: //www.google.com/search?q=+test+site:blackhatworld.com





/*

 await page.goto(`view-source:${alllinks[i]}`);
        const result = await page.evaluate(body => body.innerText, await page.$('body'));
        const $ = cherrio.load(result);
        var links = [];
        $(`li.css-qq6fb7 > a[href]`).each(function () {
            links.push({ "LINK": `https://www.sweetstudy.com${$(this).attr('href').trim()}` });
        })

        var csv = new ObjectsToCsv(links);
        await csv.toDisk(path.resolve(__dirname, '../list.csv'), { append: true })
        console.clear();
        console.log(i + "/" + alllinks.length + "\n\n");
        await T.sleep(0.2);
*/
// async function errorLog(message, url) {
//     // timetout error
//     const imagename = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.jpg`;
//     await page.screenshot({
//         path: path.resolve(__dirname, `./errors/img/${imagename}`),
//         fullPage: true
//     });
//     var msg = [{
//         MESSAGE: message,
//         SCREENSHOT: path.resolve(__dirname, `./errors/img/${imagename}`),
//         URL: url
//     }];
//     const csv = new ObjectsToCsv(msg);
//     await csv.toDisk(path.resolve(__dirname, './errors/errorlog.csv'), { append: true })

//     //page close
//     // browser close
// }

//document.querySelector(`p#ofr`)
async function dojob() {

    browser = await puppeteer.launch(T.pup_config);
    [page] = await browser.pages();
    page.setCacheEnabled(false);
    //await page.setRequestInterception(true);

    for (var i = 0; i < urls.length; i++) {
        var client = await page.target().createCDPSession()
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');
        await client.send('Network.setCacheDisabled', {
            cacheDisabled: true,
        });

        await page.goto(`${urls[i]}`, { waitUntil: 'networkidle0' });
        //await page.waitForSelector(`a[href].mailapp`);
        const result = await page.evaluate(body => body.innerHTML, await page.$('body'));
        //console.log(result);
        const $ = cherrio.load(result);
        var links = [];

        // for (let index = 0; index < document.querySelectorAll(`div.g a h3`).length; index++) {
        //     console.log(document.querySelectorAll(`div.g a h3`)[index].innerText);
        // }
        try {
            $(`li.b_algo`).each(function () {
                try {
                    if ($(this).find(`h2`).first().text().trim().length > 10) {
                        let o = { link: "", title: "", text: "" }
                        console.info("\n\x1b[31m" + $(this).find(`h2`).first().text().trim() + "\x1B[0m\n");
                        console.warn("\x1b[34m" + $(this).find(`a`).first().attr('href').trim() + "\x1B[0m\n");
                        try {
                            let a = $(this).find(`p`).first();
                            let text = a.text().trim();
                            if (text.indexOf("·") > -1 && text.indexOf("·") < 25) {
                                text = text.substr(text.indexOf("·") + 1);
                            }

                            console.error("\x1b[3m" + text.trim() + "\x1B[0m\n");
                        } catch (e) {/* console.log(e);*/ }
                    }
                } catch (e) { }
            })
        } catch (error) {

        }

        await T.sleep(3);
    }

}

dojob();