import {Component, OnInit} from "angular2/core";
import {Observable} from "rxjs/Observable";

declare var moment: any;

@Component({
    selector: "lastreading",
    template: `
        <div><span *ngIf="reading">Lasting reading was {{reading}}</span>&nbsp;</div>
    `,
    inputs: ["last"]
})
export default class LastReading implements OnInit {
    private last: number;
    private reading: string;

    public ngOnInit() {
        Observable
            .timer(1000, 2000)
            .subscribe(() => this.reading = moment(this.last).fromNow());
    }
}
