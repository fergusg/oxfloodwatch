export default class Config {
    public levels = {
        EXTREME: 30,
        VERY_HIGH: 14,
        HIGH: 7,
        CLOSE: 0,
        LOW: -10
    };

    public GAUGE_MIN = -10;
    public GAUGE_MAX = 40;

    public normalDistance = 149;

    public id = "eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3";
    public title = "Kirtlington to Tackley Footpath";
    public subtitle = "Is it flooded near Pigeons Lock?";
    public url = `https://oxfloodnet.thingzone.uk/latest/${this.id}`;
    public feedback = "floodwatch@gooses.co.uk";
}
