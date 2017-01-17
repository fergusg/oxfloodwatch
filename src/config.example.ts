/** RUNTIME */
let baseUrl = "";
const feedback = "me@example.com";

// An example of how one might want to modify things
// during development
/*
if (typeof location !== "undefined") {
    let h = location.hostname;
    if (/^192|127|localhost/.test(h)) {
        if (parseInt(location.port, 10) === 5555) {
            baseUrl = "//example.com";
        } else {
            // using gae devserver
            baseUrl = `//${h}:8080`;
        }
    }
}
*/

export const defaultConfig = { feedback, baseUrl };

/** BUILDTIME (injected into index.html)*/
export const APP_TITLE = 'xxxxxx';
export const APP_DESCR = "xxxxxx";

export const GA_ID = 'xxxxxxxxxxxxx';
