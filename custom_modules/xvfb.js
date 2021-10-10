const xvfb = require('xvfb');

var startXfvb = null;

module.exports = {
    start: () => {
        startXfvb = new xvfb({
            silent: true,
            xvfb_args: ["-screen", "0", '800x600x24', "-ac"],
        });
        startXfvb.start(
            (err) => {
                if (err) {
                    console.error(err);
                }
            }
        );
    },
    display: startXfvb.display,
    array_flags: [
        `--display=${startXfvb.display}`,
        "--single-process",
        "--start-fullscreen"
    ]
}

//config.mode == "local" --window-size=800,600 --window-position=0,0