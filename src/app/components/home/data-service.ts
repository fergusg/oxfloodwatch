import {Observable} from "rxjs/Observable";
import {Injectable} from "angular2/core";
import {Jsonp} from "angular2/http";

import {defaultConfig} from "../../../config";


@Injectable()
export default class DataService {
    private dataObservable: Observable<any>;
    constructor(private jsonp: Jsonp) {
        let url = `${defaultConfig.baseUrl}/api/timeseries?callback=JSONP_CALLBACK`;

        this.dataObservable = Observable
            .timer(1000, 30000)
            .switchMap((): Observable<any> => {
                console.log("Fetching", url);
                let ret = this.jsonp.request(url)
                    .timeout(15000, new Error("Timed out"))
                    .map((res: any) => res.json());
                return ret;
            })
            .catch(function(err) {
                console.error(err);
                return Observable.throw(err);
            });
    }

    public get data(): Observable<any> {
        return this.dataObservable;
    }
}
