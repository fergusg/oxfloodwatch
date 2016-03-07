declare var _: any;

enum FilterState {
    NONE,
    PARTIAL,
    FULL,
    NORMAL,
}

export default class DataFilter {

    public filter(data: any[][], normalDistance, filtering: FilterState = FilterState.FULL) {

        data = data.map((v) => [new Date(v[0]).getTime(), v[1]]);
        if (filtering === FilterState.NONE) {
            return data;
        }

        data = data.filter((v) => v[1] > 20 && v[1] < 200);

        if (filtering === FilterState.PARTIAL) {
            return data;
        }

        let height = this.getHeight.bind(null, normalDistance);
        data = data.map((v) => [v[0], height(v)]);

        data = _.uniq(data, (v: number[]) => v[0]);

        // find spikes +/- 40cm
        if (filtering === FilterState.NORMAL) {
            return data;
        }
        data = data.filter((v: any) => Math.abs(v[1]) < 125);
        const deltaT = 2 /* hours */ * 60 /* minutes */ * 60 * 1000;
        data = data.filter((v: any, idx: number, arr: any[]) => {
            // skip if we're at the beginning or end
            if (idx === 0 || idx === arr.length - 1) {
                return true;
            }
            let [prev, curr, next] = arr.slice(idx - 1, idx + 2);

            // averge of prev & next
            let avg = (prev[1] + next[1]) / 2;
            // diff of prev & next
            // let delta = Math.abs(prev[1] - next[1]);
            if (
                // is this point bigger than the average of the neighbouring points
                (Math.abs(curr[1] - avg) > 20)
                // are prev and next similar?
                // && (delta < 5)
            ) {
                // spike is within a timeframe?
                if (Math.abs(next[0] - prev[0]) < deltaT) {
                    return false;
                }
            }
            return true;
        });
        return data;
    }

    private getHeight(normalDistance: number, v: number[]) {
        let [value, temp] = v.slice(1);
        if (_.isFinite(temp)) {
            let newVal = ((value * 58) * (331.3 + 0.606 * temp)) / 20000;
            // console.log(`Height ${value} -> ${newVal} (T=${temp}C)`);
            value = newVal;
        }
        return Math.round(normalDistance - value);
    }
}
export {FilterState};
