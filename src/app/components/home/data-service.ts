import {Observable} from "rxjs/Observable";
import {Injectable} from "angular2/core";
import {Jsonp} from "angular2/http";

import {defaultConfig} from "../../../config";

@Injectable()
export default class DataService {
    private dataObservable: Observable<any>;
    constructor(private jsonp: Jsonp) {
        this.dataObservable = Observable
            .timer(1000, 30000)
            .switchMap((x: number, ix: number): Observable<any> => {
                return this.jsonp.request(defaultConfig.url)
                    .timeout(15000, new Error("Timed out"))
                    .delay(250)
                    .map((res: any) => res.json());
            });
    }

    get data(): Observable<any> {
        return this.dataObservable;
    }
}
