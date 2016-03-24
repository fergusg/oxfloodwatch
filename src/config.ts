let baseUrl = "";
let h = location.hostname;
if (h === 'localhost' || h === "127.0.0.1") {
    if (parseInt(location.port, 10) === 5555) {
        baseUrl = "//oxfloodwatch.appspot.com";
    } else {
        // using gae devserver
        baseUrl = `//${h}:8080`;
    }
}

const defaultConfig = {
    feedback: "oxfloodwatch@gooses.co.uk",
    baseUrl
};

export {defaultConfig};
