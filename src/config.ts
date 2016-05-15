/** RUNTIME */
let baseUrl = "";
const feedback = "oxfloodwatch@gooses.co.uk";

// (window.)location is not defined in node
if (typeof location !== "undefined") {
    let h = location.hostname;
    if (/^192|127|localhost/.test(h)) {
        if (parseInt(location.port, 10) === 5555) {
            baseUrl = "//oxfloodwatch.appspot.com";
        } else {
            // using gae devserver
            baseUrl = `//${h}:8080`;
        }
    }
}

export const defaultConfig = { feedback, baseUrl };

/** BUILDTIME */
export const APP_TITLE = 'Oxfordshire Flood Watch';
export const APP_DESCR = [
    "Flood monitor at Pigeons Lock",
    "where the Oxfordshire Way footpath crosses the River Cherwell",
    "between Kirtlington and Tackley"
].join(" ");

export const GA_ID = 'UA-75660439-1';
