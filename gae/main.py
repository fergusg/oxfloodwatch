import logging, json

from google.appengine.api import urlfetch
from google.appengine.ext import ndb

from flask import Flask, g, redirect, request, session, url_for, Response
from twilio.rest import TwilioRestClient
from flask.ext.restful import Resource, Api as RestApi

# Needs ACCOUNT_SID AUTH_TOKEN TWILIO_FROM FLOODWATCH_URL
import localsettings
import footpath


class Person(ndb.Model):
    name = ndb.StringProperty(required=True)
    setting_id = ndb.StringProperty(required=True)
    trigger_level = ndb.StringProperty(required=True)
    mobile = ndb.StringProperty(required=True)
    last_level = ndb.StringProperty(required=True)


class Setting(ndb.Model):
    id = ndb.StringProperty(required=True)
    name = ndb.StringProperty(required=True)
    normal = ndb.IntegerProperty(required=True)
    levels = ndb.StringProperty(required=True)

client = TwilioRestClient(localsettings.ACCOUNT_SID, localsettings.AUTH_TOKEN)

app = Flask(__name__)
api = RestApi(app)

API = "/api"
ADMIN = "/admin"

def sendMessage(number, message):
    client.messages.create(
        to = number,
        from_ = localsettings.TWILIO_FROM,
        body = message
    )

@app.route(API+"/dial")
def dial():
    client.calls.create(from_=localsettings.TWILIO_FROM,
                        to=localsettings.TEST_MOBILE,
                        url=url_for('.voice',  _external=True))
    return "OK"

@app.route(API+"/voice")
def voice():
    xml= """<?xml version="1.0" encoding="UTF-8" ?>
<Response>
     <Say>Hello World</Say>
</Response>
    """
    return Response(xml, mimetype='text/xml')

@api.resource(API + '/hello')
class Hello(Resource):
    def get(self):
        url = localsettings.FLOODWATCH_URL
        result = urlfetch.fetch(url)
        if result.status_code != 200:
            return {"error": result.status_code}, result.status_code

        ret = json.loads(result.content)
        return {"payload": ret["payload"]}


@api.resource(ADMIN + '/create')
class CreateDatastore(Resource):
    def get(self):
        Person(
            name="Test User",
            setting_id="default",
            trigger_level="low",
            mobile=localsettings.TEST_MOBILE,
            last_level="very_low"
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
        for f in  reversed(levels):
            if (delta > f["level"]):
                level = f["name"]
                break
        if not level:
            level=levels[0]["name"]

        return (level, delta)

    def get_current_level(self):
        url = localsettings.FLOODWATCH_URL
        result = urlfetch.fetch(url)
        if result.status_code != 200:
            raise {"error": result.status_code}

        ret = json.loads(result.content)
        return int(ret["payload"]["value"])

    def get(self):
        current_level = self.get_current_level()

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

            alert = (p.last_level != level and
                (level_idx >= trigger_idx) or
                (level_idx < trigger_idx and last_level_idx >= trigger_idx))

            msg = "%s: %s norm:%s delta:%s level:%s last:%s trigger:%s level:%s alert:%s" % (
                p.name, p.mobile, s.normal, delta, level, p.last_level, trigger_idx, level_idx, alert)
            ret.append(msg)
            logging.info(json.dumps(msg))

            if alert:
                p.last_level = level
                p.put()
                m = "Dear {pname}, the level at {sname} is currently *{level}* ({delta}cm)".format(
                    pname=p.name,
                    sname=s.name,
                    level=levels[level_idx]["desc"],
                    delta=delta
                )
                logging.info("Sending %s to %s" % (m, p.mobile))
                sendMessage(p.mobile, m)

        return ret

@api.resource(ADMIN + '/ping')
class Ping(Resource):
    def get(self):
        sendMessage(localsettings.TEST_MOBILE, "Hello to you too" )
        return {"hello": "to you too"}


@api.resource(ADMIN + '/sendhello/<number>')
class SendHello(Resource):
    def get(self, number):
        sendMessage(number, "Hello to you too" )
        return {"hello": "to you too"}

if __name__ == "__main__":
    app.run()
