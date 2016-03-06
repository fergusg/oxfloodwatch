declare var _: any;

enum FilterState {
    NONE,
    NORMAL,
    FULL,
}

export default class DataFilter {
    public filter(data: number[], filtering: FilterState = FilterState.FULL) {

        if (filtering === FilterState.NONE) {
            return data;
        }

        data = _.uniq(data, (v: number[]) => v[0]);

        // filter out silly values
        data = data.filter((v: any) => Math.abs(v[1]) < 200);

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
            let delta = Math.abs(prev[1] - next[1]);
            if (
                // is this point bigger than the average of the neighbouring points
                (Math.abs(curr[1] - avg) > 20)
                // are prev and next similar?
                && (delta < 5)
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
}
export {FilterState};
