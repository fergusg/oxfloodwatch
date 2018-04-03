import { Component } from "angular2/core";
import { RouterLink } from "angular2/router";
import * as Sites from "../home/sites/index";

declare var _: any;

interface PageLink {
    link: string;
    text?: string;
    type?: string;
}

@Component({
    selector: "index",
    moduleId: module.id,
    templateUrl: "./index.html",
    directives: [RouterLink]
})
export class IndexComponent {
    public sites: PageLink[];
    constructor() {
        this.sites = _.map(Sites, s => {
            return { link: s.name };
        });
        this.sites.push({
            link: "About",
            text: "About this site",
            type: "default"
        });
    }
}
