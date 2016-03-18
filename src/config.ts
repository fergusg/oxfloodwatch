let baseUrl = "";
if (location.hostname === 'localhost') {
    if (parseInt(location.port, 10) === 5555) {
        // baseUrl = "//localhost:8080";
        baseUrl = "http://oxfloodwatch.appspot.com";
    } else {
        // via devserver
        // baseUrl = "http://oxfloodwatch.appspot.com";
        baseUrl = "//localhost:8080";
    }
}


const defaultConfig = {
    feedback: "oxfloodwatch@gooses.co.uk",
    baseUrl
};

export {defaultConfig};
