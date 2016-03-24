import {Component} from "angular2/core";
import {RouterLink} from "angular2/router";
import * as Sites from "../home/sites/index";

declare var _: any;

@Component({
    selector: "index",
    moduleId: module.id,
    templateUrl: "./index.html",
    directives: [RouterLink]
})
export class IndexComponent {
    public sites: string[] = _.map(Sites, s => s.name);
}
