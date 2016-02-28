import logging, json

from google.appengine.api import urlfetch
from flask import Flask, g, redirect, request, session, url_for, Response
from twilio.rest import TwilioRestClient
from flask.ext.restful import Resource, Api as RestApi

from localsettings import ACCOUNT_SID, AUTH_TOKEN, TWILIO_FROM, TEST_MOBILE, FLOODWATCH_URL
from models import Setting, Person
import footpath

API = "/api"
ADMIN = "/admin"

app = Flask(__name__)
api = RestApi(app)

client = TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN)

def sendMessage(number, message):
    client.messages.create(
        to = number,
        from_ = TWILIO_FROM,
        body = message
    )

@api.resource(ADMIN + '/create')
class CreateDataStore(Resource):
    def get(self):
        Person(
            name = "Test User",
            setting_id = "default",
            trigger_level = "low",
            mobile = TEST_MOBILE,
            last_level = "very_low"
        ).put()

        Setting(
            id = footpath.id,
            name = footpath.name,
            normal = footpath.normal,
            levels = json.dumps(footpath.levels)
        ).put()

        return {}

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

    def get_current_level(self):
        url = FLOODWATCH_URL
        result = urlfetch.fetch(url)
        if result.status_code != 200:
            return (None, result.status_code)

        ret = json.loads(result.content)
        return (int(ret["payload"]["value"]), None)

    def get(self):
        (current_level, err_code) = self.get_current_level()

        if err_code is not None:
            raise {"error": err_code}

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
                m = "Dear {pname}, the level at {sname} is currently {level} ({delta}cm)".format(
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

@api.resource(ADMIN + '/ping')
class Ping(Resource):
    def get(self):
        sendMessage(TEST_MOBILE, "Hello to you too" )
        return {"hello": "to you too"}

if __name__ == "__main__":
    app.run()
