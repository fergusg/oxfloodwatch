declare var _: any;

enum FilterState {
    NONE,
    PARTIAL,
    NORMAL,
    FULL
}

export default class DataFilter {

    public filter(data: any[][], normalDistance, filtering: FilterState = FilterState.FULL) {

        // remove duplicates
        data = _.uniq(data, (v: number[]) => v[0]);

        // convert timestring to epoch ms (HighCharts likes this)
        data = data.map((v) => [new Date(v[0]).getTime(), v[1], v[2]]);

        if (filtering === FilterState.NONE) {
            return data;
        }

        // Remove "silly values"
        data = data.filter((v) => v[1] > 20 && v[1] < 200);

        if (filtering === FilterState.PARTIAL) {
            return data;
        }

        // Must have a temp
        data = data.filter((v) => _.isFinite(v[2]));

        // Map the sensor height to our "relative" height
        data = data.map((v) => {
            let [time, val, temp] = v;
            return [time, this.getHeight(val, temp, normalDistance), temp];
        });

        if (filtering === FilterState.NORMAL) {
            return data;
        }

        // Ignore spikes outside this timeframe
        const deltaT = 2 /* hours */ * 60 /* minutes */ * 60 * 1000;

        data = data.filter((v: any, idx: number, arr: any[]) => {
            // skip if we're at the beginning or end
            if (idx === 0 || idx === arr.length - 1) {
                return true;
            }
            let [prev, curr, next] = arr.slice(idx - 1, idx + 2);

            // average of prev & next
            let avg = (prev[1] + next[1]) / 2;
            // diff of prev & next
            let delta = Math.abs(prev[1] - next[1]);
            if (
                // is this point bigger than the average of the neighbouring points
                (Math.abs(curr[1] - avg) > 20)
                // are prev and next similar?
                && (delta < Infinity)
                // spike is within a timeframe?
                && (Math.abs(next[0] - prev[0]) < deltaT)
            ) {
                return false;
            }
            return true;
        });
        return data;
    }

    /*
        The rather odd formulation is basically

            d'/c' = t = d/c0

        with d = "uncompensated distance", c0 = c(T_ref), T_ref = 22.3
        and c' = c(T)

        =>  d' = d * c'/c

        The (331.3 + 0.606 * T) is the speed of sound at temp T (deg C)

        (So 331.3 + 0.606 * 22.3 = 20000/58)

        Pressure and humidity effects are small
     */
    private getHeight(value: number, temp: number, normalDistance: number) {
        if (_.isFinite(temp)) {
            let newVal = ((value * 58) * (331.3 + 0.606 * temp)) / 20000;
            // console.log(`Height ${value} -> ${newVal} (T=${temp}C)`);
            value = newVal;
        }
        return Math.round(normalDistance - value);
    }
}
export {FilterState};
