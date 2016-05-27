import {Component, ElementRef, OnChanges, SimpleChange} from "angular2/core";

declare var $: any;
declare var _: any;

@Component({
    selector: "gauge",
    moduleId: module.id,
    templateUrl: "./gauge.html",
    styleUrls: ["./gauge.css"],
    inputs: ["range", "delta", "plotBands"]
})
export default class GaugeComponent implements OnChanges {
    private delta: number;
    private deltaInches: string;


    constructor(private elem: ElementRef) {
    }


    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes["delta"] && _.isFinite(changes["delta"].currentValue)) {
            let d = changes["delta"].currentValue;
            if (_.isFinite(d)) {
                this.delta = d;
                this.deltaInches = (this.delta / 2.54).toFixed(1);
            }
        }
    }

}
