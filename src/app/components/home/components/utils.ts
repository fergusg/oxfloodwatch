export function normalDist(sigma = 1, mu = 0, n = 6) {
    var tot = 0;
    for (var i = 0; i < n; i++) {
        tot += Math.random();
    }
    return sigma * (tot - n / 2) / (n / 2) + mu;
}
