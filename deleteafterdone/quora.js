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
https://www.google.com/search?q=allintitle%3A%22how%22+AND+%22keyword%22
https://www.bing.com/search?q=intitle%3A%22how%22+AND+%22keyword%22

https://www.blackhatworld.com/search/4054608/?q=keyword&o=relevance
https://www.reddit.com/search/?q=keyword
https://stackexchange.com/search?q=keyword
*/


var CONFIG = {};
CONFIG.base_url = `https://www.quora.com/search?q=`;
//CONFIG.questions = ["how", "who", "where", "why", "how", "what"];
//CONFIG.adjectives = ["tip", "trick", "secret", "revealed", "best", "way", "method"];
CONFIG.targets = ["affiliate", "money", "income", "passive income", "recurring income"];





var urls = CONFIG.targets;
//var increment = 0;
// for (var i = 0; i < CONFIG.questions.length; i++) {
//     for (var j = 0; j < CONFIG.adjectives.length; j++) {
//         for (var k = 0; k < CONFIG.targets.length; k++) {
//             let url = `${CONFIG.base_url}${encodeURI(`intitle:"${CONFIG.questions[i]}"+AND+"${CONFIG.adjectives[j]}"+AND+"${CONFIG.targets[k]}"`)}`;
//             urls.push(url);
//         }
//     }
// }
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

var nodelogmsg = function(logg) {
    try {
        // if (config.log) {
        console.log(logg);
        // }
    } catch (err) {
        //if (config.log) {
        console.log("Log message error => :", err);
        // }
    }
}
async function dojob() {

    browser = await puppeteer.launch(T.pup_config);
    [page] = await browser.pages();
    page.setCacheEnabled(false);
    //await page.setRequestInterception(true);

    //for (var i = 0; i < urls.length; i++) {
    var client = await page.target().createCDPSession()
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    await client.send('Network.setCacheDisabled', {
        cacheDisabled: true,
    });
    await page.exposeFunction("nodeLog", nodelogmsg);
    await page.goto(`${CONFIG.base_url}${urls[0]}`);
    //await page.waitForSelector(`a[href].mailapp`);
    var jcode = fs.readFileSync(path.resolve(__dirname, '../configdata/jquery.js'), 'utf8');
    try {
        await page.evaluate(({ jcode }) => {
            var jq = document.createElement("script");
            jq.type = "text/javascript";
            jq.text = jcode;
            document.getElementsByTagName("head")[0].appendChild(jq);
        }, { jcode });
        //await T.sleep(3);
        //}


    } catch (e) {}

    try {
        await page.evaluate(({}) => {
            function remove_scrapped_elements() {
                var data1 = $("div.CssComponent-sc-1oskqb9-0.cXjXFI[scrapedd]");
                if (data1.length > 400) {
                    data1.slice(0, 350).remove();
                }
            }


            setInterval(() => {

                var data1 = $("div.CssComponent-sc-1oskqb9-0.cXjXFI:not([scrapedd])");

                if (data1.length > 0) {
                    for (var i = 0, l = parseInt(data1.length); i < l; i++) {
                        try {
                            var title = $(data1[i]).find(`a[href]:first`).text().trim();
                            var link = $(data1[i]).find(`a[href]:first`).attr("href").trim();
                            var text = $(data1[i]).find(`div.q-relative.spacing_log_answer_content`).text().trim();
                            if (title.length > 10 && link.length > 10 && text.length > 10) {
                                nodeLog({ title: title, text: text, link: link });
                            }

                        } catch (e) {}
                    }
                }


                remove_scrapped_elements();
                window.scrollTo(0, 9e30);
            }, 5000);
        }, {});
    } catch (e) {}
}
dojob();


// function remove_scrapped_elements(){
//         var data1 = $(root).find($("div.clearfix._60rh._gse>div.clearfix._8u._42ef>div.uiProfileBlockContent._61ce>div._6a>div._6a._6b>div._60ri>a[scrapedd]"));
//         var data2 = $(root_one_pages).find($("div.clearfix._60rh._gse>div.clearfix._8u._42ef>div.uiProfileBlockContent._61ce>div._6a>div._6a._6b>div._60ri>a[scrapedd]"));
//         if (data1 != null && data1.length != null && parseInt(data1.length) > 400){
//             data1.slice(0, 350).remove();
//         }
//         if (data2 != null && data2.length != null && parseInt(data2.length) > 400) {
//             data2.slice(0, 350).remove();
//         }
//     }
//     var SCRAPPED_ALL_CHECK = 0;
//     var SCRAPPED_NUM_DATA = 0;

//
//     // on stop click button 

//     var GLOBAL_INTERVAL_CELAR = null;
//     var GLOBAL_INT_SCROOL = null;
//     // infinite scrool
//     function scroolme() {
//         GLOBAL_INT_SCROOL = setInterval(function() {
//             if (GLOBAL_STOP_BUTTON) {
//                 return false;
//             }
//             window.scrollTo(0, 9e30);
//         }, 20000); // 5 sec interval

//         var GLOBAL_STOP_BUTTON = false;


//         GLOBAL_INTERVAL_CELAR = setInterval(async function() {
//             if (GLOBAL_STOP_BUTTON) {
//                 return false;
//             }

//             //check if all members are scrapped
//             if (SCRAPPED_ALL_CHECK > 3) {
//                 sucess_do_job();
//                 return false;
//             }
//             remove_scrapped_elements(); // immediate remove break scrooling new data



//             // Scrapping facebook pages
//             if (data2 != null && data2.length != null && parseInt(data2.length) > 0) {
//                 var mid = 0;
//                 var fname = "";
//                 var lname = "";
//                 var fullname = "";
//                 for (var i = 0, l = parseInt(data2.length); i < l; i++) {
//                     try {
//                         var t = data2[i];
//                         if (data2[i] != null &&
//                             data2[i].text != null &&
//                             data2[i].getAttribute("ajaxify") != null &&
//                             data2[i].text != "" &&
//                             data2[i].getAttribute("ajaxify") != "" &&
//                             data2[i].text.trim() != "" &&
//                             data2[i].getAttribute("ajaxify").trim() != ""
//                         ) {
//                             fullname = data2[i].text.trim();
//                             var params = new URLSearchParams(data2[i].getAttribute("ajaxify").trim());
//                             mid = parseInt(params.get("member_id"));
//                             var fn_ln = fullname.split(" ");
//                             fname = fn_ln[0]
//                             if (fn_ln[1] != null && fn_ln[1] != "") {
//                                 lname = fn_ln[1];
//                             } else {
//                                 lname = "";
//                             }
//                             data_array.push({
//                                 "id": mid,
//                                 "fn": fname,
//                                 "ln": lname,
//                                 "full": fullname
//                             });
//                         }
//                     } catch (e) {}
//                 }
//             }

//             // remove elements from doom later
//             $(root).find($("div.clearfix._60rh._gse>div.clearfix._8u._42ef>div.uiProfileBlockContent._61ce>div._6a>div._6a._6b>div._60ri>a")).attr("scrapedd", "scrapedd");
//             $(root_one_pages).find($("div.clearfix._60rh._gse>div.clearfix._8u._42ef>div.uiProfileBlockContent._61ce>div._6a>div._6a._6b>div._60ri>a")).attr("scrapedd", "scrapedd");

//             if (data_array != null && data_array.length != null && Array.isArray(data_array) && parseInt(data_array.length) > 0) {
//                 // update scrapped members num
//                 SCRAPPED_NUM_DATA = SCRAPPED_NUM_DATA + parseInt(data_array.length);
//                 GLOBAL_FACEBOOK_TITLE = "GroupKit | Adding Existing Members...";
//                 document.title = GLOBAL_FACEBOOK_TITLE;
//                 $("#scrapped_num_data").html("<div style=\"text-align: center;font-size: 26px;\">We are now adding your group members.</div><div style=\"text-align: center;font-size: 45px;margin-top: 14px;\"><b>" + SCRAPPED_NUM_DATA + "</b> members...</div><button id=\"all_button_stop_gk\" type=\"button\" style=\"all: unset;display: block;padding-left: 25px !important;padding-right: 25px !important;padding-top: 10px !important;padding-bottom: 10px !important;margin-right: auto;margin-left: auto;font-weight: bold;display: inline-block;text-align: center !important;text-decoration: none !important;margin-top:20px;border-radius: 3px;border: 1px solid #00000033;color: #ffffff;font-weight: 600;background-color: #e43b2c;font-size: 20px;cursor: pointer;\">Stop</button><div style=\"text-align: center;font-size: 14px;font-style: italic;margin-top: 24px;\">Sip some tea... this could take awhile depending on the size of your group</div>");
//                 // this should be in messsage onload

//                 //update status text info

//                 //send message or insert into DB
//                 var msgd = {};
//                 if(global_user_data != null && global_user_data.groupid != null && global_user_data.groupname != null && global_user_data.groupid != "" &&  global_user_data.groupname != ""){
//                     msgd.groupinfo = global_user_data;
//                 }else{
//                     msgd.groupinfo = await groupinfo_data();
//                 }
//                 msgd.scrappeddata = data_array;
//                 msgd.type = "scrapped_members_add_db";
//                 msgd.uniqid = unique_message_timestamp_data;
//                 chrome.runtime.sendMessage(msgd);


//                 //send message or insert into DB
//             }
//             //infinite scrolling

//         }, 40000); // 25 sec interval
//     }

//     $(document).on("click", "button#all_button_stop_gk", function() {
//         sucess_do_job();
//         return false;
//     });


//     async function ajax_beta_multiple_req() {
//         for (var i = 0; i < 4; i++) {
//             await ajax_facebook_beta_return_tobeta();
//         }
//     }

//     function ajax_facebook_beta_return_tobeta() {
//         return new Promise(function(resolve) {
//             if ($("input[name='fb_dtsg']") != null &&
//                 $("input[name='fb_dtsg']")[0] != null &&
//                 $("input[name='fb_dtsg']")[0].value != null &&
//                 $("input[name='fb_dtsg']")[0].value != "" &&
//                 $("input[name='fb_dtsg']").length != null &&
//                 parseInt($("input[name='fb_dtsg']").length) > 0) {
//                 $.ajax({
//                     url: "https://www.facebook.com/comet/try/",
//                     type: "POST",
//                     processData: false,
//                     contentType: "application/x-www-form-urlencoded",
//                     "headers": {
//                         "accept": "*/*",
//                         "accept-language": "en-US,en;q=0.9",
//                         "content-type": "application/x-www-form-urlencoded",
//                         "viewport-width": "794"
//                     },
//                     data: "&fb_dtsg=" +
//                         $("input[name='fb_dtsg']")[Math.floor(Math.random() * $("input[name='fb_dtsg']").length)].value,
//                     dataType: "text",
//                     success: function(data) {
//                         resolve("true");
//                     },
//                     error: function(data) {
//                         resolve("false");
//                     }
//                 });
//             } else {
//                 resolve("false");
//             }
//         });
//     }

//     var window_revert_open = false;
//     var check_if_beta = null;
//     // check if facebook beta is turned on and revert to classic facebook
//     var check_if_beta = setInterval(check_for_beta, 5000);
//     function check_for_beta(){
//         try {
//             if ($("img.hu5pjgll.lzf7d6o1[src][alt][height='20'][width='20']:eq(1)").parents("div[role='button'][tabindex='0'][aria-label]:first") != null && $("img.hu5pjgll.lzf7d6o1[src][alt][height='20'][width='20']:eq(1)").parents("div[role='button'][tabindex='0'][aria-label]:first")[0] != null) { // facebook beta on
//                 if (search_paramethers.get("groupkit_switched_to_beta") != null){
//                     //revert to classic facebook
//                     $("img.hu5pjgll.lzf7d6o1[src][alt][height='20'][width='20']:eq(1)").parents("div[role='button'][tabindex='0'][aria-label]").click();
//                     setTimeout(function(){
//                         $("img.hu5pjgll.m6k467ps[src][alt][height='20'][width='20']:eq(3)").parents("div[role='button'][tabindex='0'][class]:first").click();
//                     }, 4000);
//                     if (!window_revert_open){
//                         var msgd = {};
//                         msgd.type = "facebook_beta_return_";
//                         chrome.runtime.sendMessage(msgd);
//                         window_revert_open = true;
//                     }
//                 }else{
//                     try {
//                         var url = window.location.href + "&groupkit_switched_to_beta";
//                         window.location.href = url;
//                     } catch(e){}
//                 }
//             }else{
//                 if (search_paramethers.get("groupkit_switched_to_beta") != null) {
//                     // reverted to old facebook
//                     //revert to beta facebook
//                     ajax_beta_multiple_req();
//                     clearInterval(check_if_beta);
//                 }
//             }
//         }catch(e){}
//     }
//     setTimeout(function() {
//         clearInterval(check_if_beta);
//     }, 30000);

//     setTimeout(function(){
//         if ($("img.hu5pjgll.lzf7d6o1[src][alt][height='20'][width='20']:eq(1)").parents("div[role='button'][tabindex='0'][aria-label]:first") != null && $("img.hu5pjgll.lzf7d6o1[src][alt][height='20'][width='20']:eq(1)").parents("div[role='button'][tabindex='0'][aria-label]:first")[0] != null) { 
//             GLOBAL_FACEBOOK_TITLE = "GroupKit | Error";
//             document.title = GLOBAL_FACEBOOK_TITLE;
//             $("#scrapped_num_data").html("<div style=\"text-align: center;font-size: 26px;\">Invalid URL<br/>Scrapping not possible</div>");
//             $("#minimize_warning").hide();
//             $("#minimize_warning").hide();
//         } else if ($(root) == null || $(root)[0] == null) { // fb beta
//             GLOBAL_FACEBOOK_TITLE = "GroupKit | Error";
//             document.title = GLOBAL_FACEBOOK_TITLE;
//             $("#scrapped_num_data").html("<div style=\"text-align: center;font-size: 26px;\">You are not group admin<br/>Scrapping stopped</div>");
//             $("#minimize_warning").hide();
//             $("#minimize_warning").hide();
//         } else {
//             // do scraping function
//             scrape_members();
//         }
//     }, 30000);

//     function scrape_members(){
//         $(root_one).remove();
//         SCRAPPED_ALL_CHECK = 0;
//         SCRAPPED_NUM_DATA = 0;
//         //$(root_one_pages).remove();
//         scroolme();
//     }
// */