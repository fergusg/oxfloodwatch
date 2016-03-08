TWILIO_LIVE = {
    "SID": "....",
    "AUTH_TOKEN": "...",
    "FROM": ".....",
    "TEST_MOBILE": "....."
}
TWILIO_DEV = {
    "SID": "....",
    "AUTH_TOKEN": "....",
    "FROM": "+15005550006",
    "TEST_MOBILE": "..."
}


FLOODWATCH_ID = "....";
FLOODWATCH_URL = "https://oxfloodnet.thingzone.uk/latest/%s" % (FLOODWATCH_ID)

OW_CITY_ID="...."
OW_APPID="...."
OPENWEATHER_URL="http://api.openweathermap.org/data/2.5/forecast/city?id=%s&APPID=%s" % (OW_CITY_ID, OW_APPID)

MET_OFFICE_KEY="...."
MET_OFFICE_SITE="...."
MET_OFFICE_URL="http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/%s?res=hourly&key=%s" % (MET_OFFICE_SITE, MET_OFFICE_KEY,)
