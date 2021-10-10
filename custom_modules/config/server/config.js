module.exports = {
    config: (urlroot) => {
        try {
            if (typeof process.argv != null && Array.isArray(process.argv)) {
                if (process.argv.indexOf(`PRODUCTION=PRODUCTION`) > 1) {
                    return {
                        mode: "SERVER",
                        server: {
                            scripts: "C:\\Users\\Administrator\\Desktop\\SCRIPTS",
                            config: "C:\\Users\\Administrator\\Desktop\\SCRIPTS\\CONFIG",
                            code: "C:\\Users\\Administrator\\Desktop\\SCRIPTS\CODE",
                            output: "C:\\Users\\Administrator\\Desktop\\SCRIPTS\\OUTPUT",
                            root: "C:\\Users\\Administrator\\Desktop\\SCRIPTS",
                        }
                    };

                }

                if (process.argv.indexOf(`DEV=DEV`) > 1) {
                    return {
                        mode: "LOCAL",
                        server: {
                            scripts: "E:\\1.JOY_APP\\BINSCRIPTS",
                            config: "E:\\1.JOY_APP\\CONFIG",
                            code: "E:\\1.JOY_APP",
                            output: "E:\\1.JOY_APP\\OUTPUT",
                            root: "E:\\1.JOY_APP",
                        }
                    };

                }

                console.log(`No config defined. App can't start.`)
                return false;

            } else {
                console.log(`No config defined. App can't start.`)
                return false;
            }
        } catch (e) {
            console.log(`No config defined. App can't start.`)
            return false;
        }
    }

}