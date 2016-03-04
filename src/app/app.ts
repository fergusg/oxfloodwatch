import {Component, ViewEncapsulation} from "angular2/core";
import {RouteConfig, Redirect, Route, ROUTER_DIRECTIVES} from "angular2/router";

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
    new Redirect({ path: "/", redirectTo: ['/Default'] }),
    new Route({ path: "/sites/pigeonslock", component: Default, name: "Default" }),
    new Route({ path: "/sites/chacks", component: Chacks, name: "Chacks" })
])
export class AppCmp { }
