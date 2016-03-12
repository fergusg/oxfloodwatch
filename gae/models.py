from google.appengine.ext import ndb

class Person(ndb.Model):
    name = ndb.StringProperty(required=True)
    setting_id = ndb.StringProperty(required=True)
    trigger_level = ndb.StringProperty(required=True)
    mobile = ndb.StringProperty(required=True)
    last_level = ndb.StringProperty(required=True)


# class Setting(ndb.Model):
#     id = ndb.StringProperty(required=True)
#     name = ndb.StringProperty(required=True)
#     normal = ndb.IntegerProperty(required=True)
#     levels = ndb.StringProperty(required=True)

class Data(ndb.Model):
    time = ndb.DateTimeProperty(required=True)
    time_str = ndb.StringProperty(required=True)
    value = ndb.IntegerProperty(required=True)
    temperature = ndb.FloatProperty()
