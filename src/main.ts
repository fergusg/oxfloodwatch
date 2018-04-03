declare var jQuery: any;
const applicationCache = window.applicationCache;

import "rxjs/add/operator/map";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/publish";

import "./app/util/jquery.toaster";

import { enableProdMode } from "angular2/core";
import { bootstrap } from "angular2/platform/browser";
import { ROUTER_PROVIDERS } from "angular2/router";
import { HTTP_PROVIDERS, JSONP_PROVIDERS } from "angular2/http";

import { AppCmp } from "./app/app";

let env = "<%= ENV %>";

if (env === "prod") {
    enableProdMode();
}

if (applicationCache) {
    applicationCache.addEventListener(
        "updateready",
        () => {
            console.log("applicationCache -> reload");
            jQuery.toaster({
                title: "Update available",
                message: "Reload for latest version"
            });
        },
        false
    );
}

bootstrap(AppCmp, [...ROUTER_PROVIDERS, ...HTTP_PROVIDERS, ...JSONP_PROVIDERS]);
