declare var jQuery: any;
const applicationCache = window.applicationCache;

import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/fromArray"; // gives us .of()
import "rxjs/add/observable/timer";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/throw";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/delay";
import "rxjs/add/operator/do";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/publish";

import "./app/util/jquery.toaster";

import {provide, enableProdMode} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
import {APP_BASE_HREF} from "angular2/platform/common";
import {ROUTER_PROVIDERS} from "angular2/router";
import {HTTP_PROVIDERS, JSONP_PROVIDERS} from "angular2/http";

import {Angulartics2} from 'angulartics2/index';

import {AppCmp} from "./app/app";

if ("<%= ENV %>" === "prod") { enableProdMode(); }

if (applicationCache) {
    applicationCache.addEventListener('updateready', () => {
        console.log("applicationCache -> reload");
        jQuery.toaster({
            title: 'Update available',
            message: 'Reload for latest version'
        });
        // window.location.reload();
    }, false);
}

bootstrap(AppCmp, [
    ...ROUTER_PROVIDERS,
    ...HTTP_PROVIDERS,
    ...JSONP_PROVIDERS,
    Angulartics2,
    provide(APP_BASE_HREF, { useValue: "/" })
]);
