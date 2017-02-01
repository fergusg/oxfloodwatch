import logging, json, random, os, time
from dateutil import parser
from datetime import datetime, timedelta
from operator import itemgetter

from google.appengine.api import urlfetch, memcache
from google.appengine.ext import ndb
from google.appengine.api.urlfetch_errors import DeadlineExceededError

from flask import Flask, g, redirect, request, session, url_for, Response, current_app
from flask.ext.restful import Resource, Api as RestApi
from functools import wraps
from twilio.rest import TwilioRestClient

from localsettings import FLOODWATCH_URL, OPENWEATHER_URL, MET_OFFICE_URL
from models import Person, Data
from extend_jsonp import support_jsonp

API = "/api"
ADMIN = "/admin"

LOCALHOST = os.environ["SERVER_NAME"] in ("localhost")

if LOCALHOST:
    from localsettings import TWILIO_DEV as TWILIO
else:
    from localsettings import TWILIO_LIVE as TWILIO


app = Flask(__name__)
api = RestApi(app)
support_jsonp(api)

client = TwilioRestClient(TWILIO["SID"], TWILIO["AUTH_TOKEN"])

Settings = {}
def initSettings():
    import sites
    for name in sites.__all__:
        s = __import__("sites.%s" % name, fromlist=[''])
        Settings[s.id] = {
            "name": s.name,
            "normal": s.normal,
            "levels": s.levels
        }

def safeget(dct, *keys):
    for key in keys:
        try:
            dct = dct[key]
        except KeyError:
            return None
    return dct

def get_current_temp_ow(nocache=False):
    data = memcache.get("temperature")

    if not data or nocache:
        try:
            result = urlfetch.fetch(OPENWEATHER_URL, deadline=10)
        except DeadlineExceededError:
            return (None, "timeout")
        if result.status_code != 200:
            return (None, result.status_code)

        ret = json.loads(result.content)
        temp = safeget(ret, "main", "temp")
        if not temp:
            return (None, "Invalid temp")

        # temp in K
        temp = int(100*(temp - 273.15))/100.0
        now = int(time.time() * 1000)
        data = {"temperature" : temp, "timestamp" : now}
        memcache.set("temperature", json.dumps(data), time=3600)
    else:
        data = json.loads(data)

    return (data, None)

def get_current_temp(nocache=False):
    data = memcache.get("temperature")
    now = int(time.time() * 1000)

    if (data is None) or nocache:
        try:
            result = urlfetch.fetch(MET_OFFICE_URL, deadline=10)
        except DeadlineExceededError:
            logging.warn("Timeout for %s" % MET_OFFICE_URL)
            return (None, "timeout")
        if result.status_code != 200:
            return (None, result.status_code)

        ret = json.loads(result.content)


        # temp in C
        # ret["SiteRep"]["DV"]["Location"]["Period"][-1]["Rep"][-1]["T"]
        temp = safeget(ret, "SiteRep", "DV", "Location", "Period", -1, "Rep", -1, "T")

        if temp is not None:
            temp = float(temp)
            data = {"temperature" : temp, "timestamp" : now}
            memcache.set("temperature", json.dumps(data), time=3600)
        else:
            data = {"temperature" : None, "timestamp" : now}
    else:
        data = json.loads(data)

    return (data, None)

def get_current_level():
    url = FLOODWATCH_URL
    try:
        result = urlfetch.fetch(url, deadline=15)
    except DeadlineExceededError:
        return (None, None, "timeout")
    if result.status_code != 200:
        return (None, None, result.status_code)

    ret = json.loads(result.content)
    return (int(ret["payload"]["value"]), ret["payload"]["timestamp"], None)

def sendMessage(number, message):
    client.messages.create(
        to = number,
        from_ = TWILIO["FROM"],
        body = message
    )

def remove_duplicates(values, idx=0):
    output = []
    seen = set()
    for value in values:
        if value[idx] not in seen:
            output.append(value)
            seen.add(value[idx])
    return output

def refresh():
    then = datetime.now() - timedelta(days=3)
    ret = []
    for d in Data.query(Data.time > then):
        ret.append([d.time_str, d.value, d.temperature])
    ret = remove_duplicates(ret)

    ret = sorted(ret, key = lambda v: v[0], reverse=True)

    memcache.set(key="timeseries", value=json.dumps(ret))
    return ret

def makedata():
    ndb.delete_multi(
        Data.query().fetch(keys_only=True)
    )
    now = datetime.now()
    for i in xrange(24*4):
        t = now - timedelta(seconds=i*15*60)
        v = 149 - random.randint(0,50)
        temp = random.randint(-10, 20)
        # GAE barfs if tzinfo defined
        Data(time=t.replace(tzinfo=None), value=v, temperature = temp,
            time_str=t.strftime("%Y-%m-%dT%H:%M:%SZ")
        ).put()

def getTimeseries(force=False):
    if force:
        return refresh()

    timeseries = memcache.get(key="timeseries")

    if timeseries:
        return json.loads(timeseries)

    return None

def init():
    ndb.delete_multi(
        Person.query().fetch(keys_only=True)
    )

    Person(
        name = "Test User",
        setting_id = "default",
        trigger_level = "close",
        mobile = TWILIO["TEST_MOBILE"],
        last_level = "very_low"
    ).put()

    makedata()

def adjust_height(value, temp):
    if temp is None:
        return None
    v = ((value * 58) * (331.3 + 0.606 * temp)) / 20000
    return int(round(v))

initSettings()

refresh()

if LOCALHOST:
    init()

#######################################################
# ADMIN API ###########################################
#######################################################

@api.resource(ADMIN + '/sendalerts')
class ListAll(Resource):
    def getLevel(self, normal, levels, current_level):
        delta = normal - current_level
        level = None
        for f in reversed(levels):
            if (delta > f["level"]):
                level = f["name"]
                break
        if not level:
            level=levels[0]["name"]

        return (level, delta)

    def get(self):
        ts = getTimeseries()
        if not ts:
            m = "sendalerts abort - no timeseries"
            logging.info(m)
            return m

        # Filter temp=null
        ts = [ t for t in ts if t[2] is not None]
        if len(ts) == 0:
            m = "sendalerts abort - no readings"
            logging.info(m)
            return m

        ts = [[t[0], adjust_height(t[1], t[2]), t[2]] for t in ts]

        (current_time, current_level, current_temp) = ts[0]

        if current_temp is None:
            m = "sendalerts abort - current temp unknown"
            logging.info(m)
            return m

        # Try to detect spikes - if this level is 50cm higher than avg of the prev 3 readings, abort
        recent_levels = [float(x[1]) for x in ts[1:4]]
        n_recent_levels = max(len(recent_levels),1)

        avg_recent = sum(recent_levels)/n_recent_levels
        if abs(current_level - avg_recent) > 50:
            m = "sendalerts abort - spike?"
            logging.info(m)
            return m

        ret = []

        for p in Person.query():
            s = Settings[p.setting_id]
            levels = s["levels"]
            (level, delta) = self.getLevel(s["normal"], levels, current_level)
#            (level, delta) = ("extreme", 40)

            level_names = [f["name"] for f in levels]
            trigger_idx = level_names.index(p.trigger_level)
            level_idx = level_names.index(level)
            last_level_idx = level_names.index(p.last_level)

            alert = (
                p.last_level != level and
                (
                    (level_idx >= trigger_idx) or
                    (level_idx < trigger_idx and last_level_idx >= trigger_idx)
                )
            )

            msg = "%s: %s norm:%s delta:%s level:%s last:%s trigger:%s level:%s alert:%s" % (
                p.name, p.mobile, s["normal"], delta, level, p.last_level, trigger_idx, level_idx, alert)
            ret.append(msg)
            logging.info(json.dumps(msg))

            if alert:
                p.last_level = level
                p.put()
                m = "Dear {pname}, the level at {sname} is now {level} ({delta}cm)".format(
                    pname=p.name,
                    sname=s["name"],
                    level=levels[level_idx]["desc"],
                    delta=delta
                )
                logging.info("Sending %s to %s" % (m, p.mobile))
                try:
                    sendMessage(p.mobile, m)
                except Exception as e:
                    logging.error(e)

        return ret

@api.resource(ADMIN + '/update')
class AdminLatest(Resource):
    def get(self):
        timeseries = getTimeseries()
        if not timeseries:
            timeseries = getTimeseries(force=True)
            if timeseries == None:
                logging.error("AdminLatest Error - no timeseries")
                return ""

        (current_level, timestamp, err_code) = get_current_level()

        if err_code is not None:
            raise Exception("AdminLatest Error: code={0}".format(err_code))


        (t_data, err) = get_current_temp()
        if err:
            temp = None
        else:
            temp = t_data["temperature"]

        Data(time=parser.parse(timestamp).replace(tzinfo=None),
            value=current_level,
            time_str=timestamp,
            temperature=temp
        ).put()

        timeseries.insert(0, [timestamp, current_level, temp])

        timeseries = sorted(timeseries, key=itemgetter(0), reverse=True)
        timeseries = remove_duplicates(timeseries)

        memcache.set(key="timeseries", value=json.dumps(timeseries))

        return [current_level, timestamp, temp]

@api.resource(ADMIN + '/purge')
class Purge(Resource):
    def get(self):
        now = datetime.now()
        delta = timedelta(days=7)
        then = now - delta
        ndb.delete_multi(
            Data.query(Data.time < then).fetch(keys_only=True)
        )
        refresh()
        return {}


###################################################
### PUBLIC API ####################################
###################################################

@api.resource(API + '/config/<site>')
class Config(Resource):
    def get(self, site):
        s = Settings[site]
        l = [ t["level"] for t in s["levels"] ]
        return {
            "normalDistance" : s["normal"],
            "levels": {
                "min": s.get("min", l[0]),
                "very_low": l[0],
                "low": l[1],
                "close": l[2],
                "high": l[3],
                "very_high": l[4],
                "extreme": l[5],
                "max": s.get("max", l[5]+10)
            }
        }

@api.resource(API + '/latest')
class Latest(Resource):
    def get(self):
        ts = getTimeseries()
        (time_str_0, value_0, temp_0) = ts[0]
        time_0 = parser.parse(time_str_0)
        (time_str_1, value_1, temp_0) = ts[1]
        time_1 = parser.parse(time_str_1)

        value = value_0
        time_str = time_str_0
        # Bad reading?
        if value_0 - value_1 > 10:
            value = value_1
            time_str = time_str_1

        return {"payload":{"value":value,"timestamp":time_str}}

@api.resource(API + '/timeseries')
class TimeSeries(Resource):
    def get(self):
        return getTimeseries()

##### This stuff dev only

@api.resource(ADMIN + '/create')
class CreateDataStore(Resource):
    def get(self):
        Person(
            name = "Test User",
            setting_id = "default",
            trigger_level = "close",
            mobile = TWILIO["TEST_MOBILE"],
            last_level = "very_low"
        ).put()

        return {}

@api.resource(ADMIN + '/ping')
class Ping(Resource):
    def get(self):
        sendMessage(TWILIO["TEST_MOBILE"], "Hello to you too" )
        return {"hello": "to you too"}

@api.resource(ADMIN + '/temp')
class Temp(Resource):
    def get(self):
        (t_data1, err) = get_current_temp(nocache=True)
        (t_data2, err) = get_current_temp_ow(nocache=True)
        return [t_data1, t_data2]

if __name__ == "__main__":
    app.run()
