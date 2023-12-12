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
