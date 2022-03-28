# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import os
import flask
import flask_login
from datetime import timedelta
from superset import app

SESSION_TIMEOUT = int(os.environ.get("SESSION_TIMEOUT_MINUTES", 2))


def make_session_expire():
    flask.session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=SESSION_TIMEOUT)
    flask.session.modified = True
    flask.g.user = flask_login.current_user


def flask_app_mutator_sn(app: flask.Flask) -> None:
    app.before_request_funcs.setdefault(None, []).append(make_session_expire)
