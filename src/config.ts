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

    public messages = {
        VERY_LOW: "So low, even the camels are nervous.",
        LOW: "If the river were [depth]cm higher, you might get wet feet.",
        CLOSE: "It's a close call. You might get a wee bit soggy but you probably can get around the edge with care.",
        HIGH: "Looks like you might get damp. But if you have suitable footwear you still might get through OK.",
        VERY_HIGH: "Pretty damned deep. Wellies only",
        EXTREME: "Call Jacques Cousteau"
    };
}
