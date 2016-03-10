import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/fromArray"; // gives us .of()
import "rxjs/add/observable/timer";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/delay";
import "rxjs/add/operator/do";
import "rxjs/add/operator/flatMapLatest";

import {provide, enableProdMode} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
import {ROUTER_PROVIDERS, APP_BASE_HREF} from "angular2/router";
import {HTTP_PROVIDERS} from "angular2/http";
import {AppCmp} from "./app/app";

if ("<%= ENV %>" === "prod") { enableProdMode(); }

bootstrap(AppCmp, [
  ...ROUTER_PROVIDERS,
  ...HTTP_PROVIDERS,
  provide(APP_BASE_HREF, { useValue: "/" })
]);
