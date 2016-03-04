const feedback = "floodwatch@gooses.co.uk";
let url= "/api/timeseries?callback=JSONP_CALLBACK";
if (location.hostname === 'localhost') {
    url = "//localhost:8080" + url;
}

const defaultConfig = {
    feedback,
    url
};

export {defaultConfig};
