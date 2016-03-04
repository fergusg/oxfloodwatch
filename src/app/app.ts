import {Component, ViewEncapsulation} from "angular2/core";
import {RouteConfig, Redirect, ROUTER_DIRECTIVES} from "angular2/router";

import {Default, Chacks} from "./components";

@Component({
    selector: "app",
    moduleId: module.id,
    templateUrl: "./app.html",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    new Redirect({ path: "/chacks", redirectTo: ['/Chacks'] }),
    { path: "/sites/pigeonslock", component: Default, name: "Default", useAsDefault: true },
    { path: "/sites/chacks", component: Chacks, name: "Chacks" }
])
export class AppCmp { }
