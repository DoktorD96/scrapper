const log = {
    text: {
        error: "There was an error while trying to log message.",
        default: "There is no text to log."
    },
    colors: {
        e1: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            brBlack: "\x1b[1;30m",
            brRed: "\x1b[1;31m",
            brGreen: "\x1b[1;32m",
            brYellow: "\x1b[1;33m",
            brBlue: "\x1b[1;34m",
            brMagenta: "\x1b[1;35m",
            brCyan: "\x1b[1;36m",
            brWhite: "\x1b[1;37m",
            reset: "\x1B[0m"
                //brightGreen shorted to brColor
        }
    },
    colornames: [
        "", // so I can use index from 1
        "black",
        "red",
        "green",
        "yellow",
        "blue",
        "magenta",
        "cyan",
        "white",
        "brightblack",
        "brightred",
        "brightgreen",
        "brightyellow",
        "brightblue",
        "brightmagenta",
        "brightcyan",
        "brightwhite"
    ],


    log: function(text, color) {

        try {
            if (typeof color == null || color == null) {
                color = "brightwhite";
            } else {
                var colorindex = log.colornames.indexOf(color);
                if (colorindex > 0) {
                    //color = log.colornames[colorindex];
                } else {
                    color = "brightwhite";
                }
            }
        } catch (e) {
            color = "brightwhite";
        }

        //text code is ok
        try {
            if (typeof text == "string") {
                text = text.trim();
            } else if (typeof text == "symbol") {
                text = log.text.default;
            } else if (typeof text == "undefined") {
                text = log.text.default;
            } else if (typeof text == null || text == null) {
                text = log.text.default;
            } else if (typeof text == "object") {
                text = JSON.stringify(text).trim();
            } else if (typeof text == "number" || typeof text == "boolean" || typeof text == "bigint") {
                text = text.toString().toLowerCase().trim();
            } else if (typeof text != "string") {
                text = text.toString().trim();
            }
            if (text.length > 100) {
                text = text.substr(0, 100);
                text = text + " ...";
            }

            // remove emoji

            text = text.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gum, '[*]');
            //text = text.replace(/(\r\n|\n|\r)/gm, " ");
            //text = unescape(text);
            //text = text.replace(/\\[/gm, "<-|");
        } catch (e) {
            text = log.text.error;
        }

        try {
            if (color == "brightwhite") {
                console.info(`${log.colors.e1.brWhite}${text}${log.colors.e1.reset}`);
                return;
            } else {
                if (color == "black") {
                    console.info(`${log.colors.e1.black}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "red") {
                    console.info(`${log.colors.e1.red}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "green") {
                    console.info(`${log.colors.e1.green}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "yellow") {
                    console.info(`${log.colors.e1.yellow}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "blue") {
                    console.info(`${log.colors.e1.blue}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "magenta") {
                    console.info(`${log.colors.e1.magenta}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "cyan") {
                    console.info(`${log.colors.e1.cyan}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightblack") {
                    console.info(`${log.colors.e1.brBlack}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightred") {
                    console.info(`${log.colors.e1.brRed}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightgreen") {
                    console.info(`${log.colors.e1.brGreen}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightyellow") {
                    console.info(`${log.colors.e1.brYellow}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightblue") {
                    console.info(`${log.colors.e1.brBlue}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightmagenta") {
                    console.info(`${log.colors.e1.brMagenta}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "brightcyan") {
                    console.info(`${log.colors.e1.brCyan}${text}${log.colors.e1.reset}`);
                    return;
                }
                if (color == "white") {
                    console.info(`${log.colors.e1.white}${text}${log.colors.e1.reset}`);
                    return;
                }
                console.info(`${log.colors.e1.brWhite}${text}${log.colors.e1.reset}`);
                return;
            }
        } catch (e) {
            console.info(`${log.colors.e1.brWhite}${text}${log.colors.e1.reset}`);
            return;
        }


    },
    error: function(message) {
        try {
            log.log(message, "brightred");
        } catch (error) {}
    },
    loglog: function(message) {
        try {
            log.log(message, "white");
        } catch (error) {}
    },
    errorlog: function(message) {
        try {
            log.log(message, "red");
        } catch (error) {}
    },
    info: function(message) {
        try {
            log.log(message, "brightcyan");
        } catch (error) {}
    },
    infolog: function(message) {
        try {
            log.log(message, "cyan");
        } catch (error) {}
    },
    success: function(message) {
        try {
            log.log(message, "brightgreen");
        } catch (error) {}
    },
    successlog: function(message) {
        try {
            log.log(message, "green");
        } catch (error) {}
    },
    warn: function(message) {
        try {
            log.log(message, "brightyellow");
        } catch (error) {}
    },
    warnlog: function(message) {
        try {
            log.log(message, "yellow");
        } catch (error) {}
    },
    debug: function(message) {
        console.log(message);
        try {
            log.log(message, "brightmagenta");
        } catch (error) {}
    },
    debuglog: function(message) {
        try {
            log.log(message, "magenta");
        } catch (error) {}
    }
};

module.exports = log;