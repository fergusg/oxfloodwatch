import logging

from flask import Flask, g, redirect, request, session
from twilio.rest import TwilioRestClient
from flask.ext.restful import Resource, Api as RestApi

# Needs ACCOUNT_SID AUTH_TOKEN
import localsettings

client = TwilioRestClient(localsettings.ACCOUNT_SID, localsettings.AUTH_TOKEN)

app = Flask(__name__)
api = RestApi(app)
API = '/backend'

@api.resource(API + '/hello/<number>')
class Hello(Resource):
    def get(self, number):
        client.messages.create(
            to=number,
            from_="+441133207256",
            body="Arse",
        )
        return {"hello": "to you too"}

if __name__ == "__main__":
    app.run()
