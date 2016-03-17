import {Component, ViewEncapsulation} from "angular2/core";
import {RouteConfig, Redirect, Route, ROUTER_DIRECTIVES} from "angular2/router";

import {Footpath, Chacks, About, Jane, IndexComponent} from "./components";

@Component({
    selector: "app",
    moduleId: module.id,
    template: "<router-outlet></router-outlet>",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    new Route({ path: "/", component: IndexComponent, name: "Index" }),
    new Route({ path: "/sites/pigeonslock", component: Footpath, name: "Footpath" }),
    new Route({ path: "/sites/chacks", component: Chacks, name: "Chacks" }),
    new Route({ path: "/sites/jane", component: Jane, name: "Jane" }),
    new Route({ path: "/pages/about", component: About, name: "About" }),
    new Redirect({ path: "/chacks", redirectTo: ['/Chacks'] })
])
export class AppCmp { }
