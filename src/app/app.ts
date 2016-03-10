import {Component, ViewEncapsulation} from "angular2/core";
import {RouteConfig, Redirect, Route, ROUTER_DIRECTIVES} from "angular2/router";

import {Default, Chacks, About, Jane} from "./components";

@Component({
    selector: "app",
    moduleId: module.id,
    template: "<router-outlet></router-outlet>",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    new Redirect({ path: "/chacks", redirectTo: ['/Chacks'] }),
    new Redirect({ path: "/", redirectTo: ['/Default'] }),
    new Route({ path: "/sites/pigeonslock", component: Default, name: "Default" }),
    new Route({ path: "/sites/chacks", component: Chacks, name: "Chacks" }),
    new Route({ path: "/sites/jane", component: Jane, name: "Jane" }),
    new Route({ path: "/pages/about", component: About, name: "About" })
])
export class AppCmp { }
