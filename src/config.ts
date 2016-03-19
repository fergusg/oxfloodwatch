let baseUrl;
if (parseInt(location.port, 10) === 5555) {
    baseUrl = "http://oxfloodwatch.appspot.com";
} else if (location.hostname === 'localhost') {
    baseUrl = "//localhost:8080";
} else {
     baseUrl = "http://oxfloodwatch.appspot.com";
}

const defaultConfig = {
    feedback: "oxfloodwatch@gooses.co.uk",
    baseUrl
};

export {defaultConfig};
