import logging, json, random
from dateutil import parser
from datetime import datetime, timedelta

from google.appengine.api import urlfetch, memcache
from google.appengine.ext import ndb

from flask import Flask, g, redirect, request, session, url_for, Response, current_app
from flask.ext.restful import Resource, Api as RestApi
from functools import wraps
from twilio.rest import TwilioRestClient

from localsettings import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TEST_MOBILE, FLOODWATCH_URL
from models import Setting, Person, Data
import footpath
from extend_jsonp import support_jsonp

API = "/api"
ADMIN = "/admin"

app = Flask(__name__)
api = RestApi(app)
support_jsonp(api)

client = TwilioRestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def sendMessage(number, message):
    client.messages.create(
        to = number,
        from_ = TWILIO_FROM,
        body = message
    )

def get_current_level():
    url = FLOODWATCH_URL
    result = urlfetch.fetch(url)
    if result.status_code != 200:
        return (None, result.status_code)

    ret = json.loads(result.content)
    return (int(ret["payload"]["value"]), ret["payload"]["timestamp"], None)


@api.resource(ADMIN + '/list')
class ListAll(Resource):
    def getLevel(self, s, levels, current_level):
        delta = s.normal - current_level
        level = None
        for f in reversed(levels):
            if (delta > f["level"]):
                level = f["name"]
                break
        if not level:
            level=levels[0]["name"]

        return (level, delta)

    def get(self):
        d = Data.query().order(-Data.time).get()
        if not d:
            return []
        current_level = d.value

        ret = []

        for p in Person.query():
            s = Setting.query(Setting.id == p.setting_id).get()
            levels = json.loads(s.levels)
            (level, delta) = self.getLevel(s, levels, current_level)
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
                p.name, p.mobile, s.normal, delta, level, p.last_level, trigger_idx, level_idx, alert)
            ret.append(msg)
            logging.info(json.dumps(msg))

            if alert:
                p.last_level = level
                p.put()
                m = "Dear {pname}, the level at {sname} is now {level} ({delta}cm)".format(
                    pname=p.name,
                    sname=s.name,
                    level=levels[level_idx]["desc"],
                    delta=delta
                )
                logging.info("Sending %s to %s" % (m, p.mobile))
                try:
                    sendMessage(p.mobile, m)
                except Exception as e:
                    logging.error(e)

        return ret

@api.resource(ADMIN + '/latest')
class AdminLatest(Resource):
    def get(self):
        (current_level, timestamp, err_code) = get_current_level()

        if err_code is not None:
            raise {"error": err_code}

        Data(time=parser.parse(timestamp).replace(tzinfo=None), value=current_level, time_str=timestamp).put()

        return [current_level, timestamp]

###################################################
### API ###########################################
###################################################

@api.resource(API + '/latest')
class Latest(Resource):
    def get(self):
        d = Data.query().order(-Data.time).get()
        return {"payload":{"value":d.value,"timestamp":d.time_str}}

@api.resource(API + '/timeseries')
class TimeSeries(Resource):
    def get(self):
        ts = memcache.get(key="timeseries")
        # if ts:
        #     return ts

        now = datetime.now()
        delta = timedelta(days=1)
        then = now - delta
        q = Data.query(Data.time > then).order(-Data.time)
        ret = []
        for d in q:
            ret.append([d.time_str, d.value])

        memcache.set(key="timeseries", value=ret, time=5*60) # 5 mins
        return ret

##### This stuff dev only

@api.resource(ADMIN + '/create')
class CreateDataStore(Resource):
    def get(self):
        Setting(
            id = footpath.id,
            name = footpath.name,
            normal = footpath.normal,
            levels = json.dumps(footpath.levels)
        ).put()

        Person(
            name = "Test User",
            setting_id = footpath.id,
            trigger_level = "close",
            mobile = TEST_MOBILE,
            last_level = "very_low"
        ).put()

        return {}

@api.resource(ADMIN + '/makedata')
class MakeData(Resource):
    def get(self):
        ndb.delete_multi(
            Data.query().fetch(keys_only=True)
        )
        now = datetime.now()
        for i in xrange(24*4):
            t = now - timedelta(seconds=i*15*60)
            v = 149 + random.randint(-30, 40)
            # "2016-02-29T19:04:25.596Z"
            Data(time=t.replace(tzinfo=None), value=v,
                time_str=t.strftime("%Y-%m-%dT%H:%M:%SZ")
            ).put()

        return {}

@api.resource(ADMIN + '/ping')
class Ping(Resource):
    def get(self):
        sendMessage(TEST_MOBILE, "Hello to you too" )
        return {"hello": "to you too"}

if __name__ == "__main__":
    app.run()
