import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";
import {defaultConfig} from "../../../config";
import {Gallery} from "./gallery";

declare var jQuery: any;

@Component({
    selector: "about",
    templateUrl: "./about.html",
    moduleId: module.id,
    directives: [...ROUTER_DIRECTIVES, Gallery],
    styleUrls: ["./about.css"]
})
class About {
    public feedback = defaultConfig.feedback;

    public ngOnInit() {
        if (window.location.hostname === "localhost") {
            jQuery.toaster({
                title: 'Updated available',
                message: 'Reload for latest version',
                settings: {
                    timeout: 3000
                }
            });
        }
    }
}

export {About};
