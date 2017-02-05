export function normalDist(sigma = 1, mu = 0, n = 6): number {
    var tot = 0;
    for (var i = 0; i < n; i++) {
        tot += Math.random();
    }
    return sigma * (tot - n / 2) / (n / 2) + mu;
}

export function limit(h: number, min: number, max: number): any[] {
    let [high, low] = [false, false];

    if (h < min) {
        h = min - 1;
        low = true;
    } else if (h > max) {
        h = max + 1;
        high = true;
    }
    return [h, high || low, low, high];
}
