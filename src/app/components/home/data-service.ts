import {Observable} from "rxjs/Observable";
import {Injectable} from "angular2/core";
import {Jsonp} from "angular2/http";

import {defaultConfig} from "../../../config";

@Injectable()
export default class DataService {
    private publisher: Observable<any>;
    constructor(private jsonp: Jsonp) {
        let url = `${defaultConfig.baseUrl}/api/timeseries?callback=JSONP_CALLBACK`;

        this.publisher = Observable
            .timer(10, 30000)
            .switchMap((): Observable<any> => {
                console.log("Fetching", url);
                return this.jsonp.request(url)
                    .timeout(15000, new Error("Timed out"))
                    .map((res: any) => res.json());
            })
            .catch(function(err) {
                console.error(err);
                return Observable.throw(err);
            }).publish().refCount();
    }

    public get data(): Observable<any> {
        return this.publisher;
    }
}
