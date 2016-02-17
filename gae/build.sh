#!/bin/bash

set -e

cd $(dirname $0)

(cd ..; npm run build.prod)

~/apps/appengine-python/appcfg.py update .
