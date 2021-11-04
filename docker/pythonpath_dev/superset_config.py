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
#
# This file is included in the final Docker image and SHOULD be overridden when
# deploying the image to prod. Settings configured here are intended for use in local
# development environments. Also note that superset_config_docker.py is imported
# as a final step as a means to override "defaults" configured here
#
import logging
import os
from datetime import timedelta
from typing import Optional

from cachelib.file import FileSystemCache
from celery.schedules import crontab

from superset_config import *
from cachelib import RedisCache
from superset.typing import CacheConfig

from flask_appbuilder.security.manager import AUTH_DB, AUTH_LDAP
from superset.security.custom_manager import CDASecurityManager

logger = logging.getLogger()


def get_env_variable(var_name: str, default: Optional[str] = None) -> str:
    """Get the environment variable or raise exception."""
    try:
        return os.environ[var_name]
    except KeyError:
        if default is not None:
            return default
        else:
            error_msg = "The environment variable {} was missing, abort...".format(
                var_name
            )
            raise EnvironmentError(error_msg)


DATABASE_DIALECT = get_env_variable("DATABASE_DIALECT")
DATABASE_USER = get_env_variable("DATABASE_USER")
DATABASE_PASSWORD = get_env_variable("DATABASE_PASSWORD")
DATABASE_HOST = get_env_variable("DATABASE_HOST")
DATABASE_PORT = get_env_variable("DATABASE_PORT")
DATABASE_DB = get_env_variable("DATABASE_DB")

# The SQLAlchemy connection string.
SQLALCHEMY_DATABASE_URI = "%s://%s:%s@%s:%s/%s" % (
    DATABASE_DIALECT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_DB,
)

REDIS_HOST = get_env_variable("REDIS_HOST")
REDIS_PORT = get_env_variable("REDIS_PORT")
REDIS_CELERY_DB = get_env_variable("REDIS_CELERY_DB", "0")
REDIS_RESULTS_DB = get_env_variable("REDIS_RESULTS_DB", "1")

RESULTS_BACKEND = FileSystemCache("/app/superset_home/sqllab")

THUMBNAIL_SELENIUM_USER = "admin"
THUMBNAIL_CACHE_CONFIG: CacheConfig = {
    'CACHE_TYPE': 'redis',
    'CACHE_DEFAULT_TIMEOUT': 24 * 60 * 60 * 30,
    'CACHE_KEY_PREFIX': 'thumbnail_',
    'CACHE_NO_NULL_WARNING': True,
    'CACHE_REDIS_URL': 'redis://%s:%s/1' % (REDIS_HOST, REDIS_PORT)
}
SCREENSHOT_LOCATE_WAIT = 100
SCREENSHOT_LOAD_WAIT = 600
RESULTS_BACKEND = RedisCache(host=REDIS_HOST, port=REDIS_PORT,
                             key_prefix='superset_results')


class CeleryConfig(object):
    BROKER_URL = 'redis://%s:%s/0' % (REDIS_HOST, REDIS_PORT)
    CELERY_IMPORTS = (
    'superset.sql_lab', "superset.tasks", "superset.tasks.thumbnails",)
    CELERY_RESULT_BACKEND = 'redis://%s:%s/0' % (REDIS_HOST, REDIS_PORT)
    CELERYD_PREFETCH_MULTIPLIER = 10
    CELERY_ACKS_LATE = True
    CELERY_ANNOTATIONS = {
        'sql_lab.get_sql_results': {
            'rate_limit': '100/s',
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 600,
            'soft_time_limit': 600,
            'ignore_result': True,
        },
    }
    CELERYBEAT_SCHEDULE = {
        'reports.scheduler': {
            'task': 'reports.scheduler',
            'schedule': crontab(minute='*', hour='*'),
        },
        'reports.prune_log': {
            'task': 'reports.prune_log',
            'schedule': crontab(minute=0, hour=0),
        },
        'cache-warmup-hourly': {
            'task': 'cache-warmup',
            'schedule': crontab(minute='*/30', hour='*'),
            'kwargs': {
                'strategy_name': 'top_n_dashboards',
                'top_n': 10,
                'since': '7 days ago',
            },
        },
    }


CELERY_CONFIG = CeleryConfig

WEBDRIVER_TYPE = "chrome"
FEATURE_FLAGS = {"ALERT_REPORTS": True}
ALERT_REPORTS_NOTIFICATION_DRY_RUN = True
WEBDRIVER_BASEURL = "http://superset:8088/"
# The base URL for the email report hyperlinks.
WEBDRIVER_BASEURL_USER_FRIENDLY = WEBDRIVER_BASEURL

SQLLAB_CTAS_NO_LIMIT = True

#
# Optionally import superset_config_docker.py (which will have been included on
# the PYTHONPATH) in order to allow for local settings to be overridden
#
try:
    import superset_config_docker
    from superset_config_docker import *  # noqa

    logger.info(
        f"Loaded your Docker configuration at " f"[{superset_config_docker.__file__}]"
    )
except ImportError:
    logger.info("Using default Docker config...")

CUSTOM_SECURITY_MANAGER = CDASecurityManager

AUTH_TYPE = AUTH_LDAP
AUTH_ROLE_ADMIN = 'Admin'
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Public"
AUTH_LDAP_GROUP_FIELD = "memberOf"

AUTH_ROLES_MAPPING = {
    get_env_variable("AUTH_ROLES_MAPPING"): ["Admin"]
}
AUTH_LDAP_SERVER = "ldap://{}/".format(get_env_variable("AUTH_LDAP_SERVER_IP"))
AUTH_LDAP_SEARCH = get_env_variable("AUTH_LDAP_SEARCH")
AUTH_LDAP_UID_FIELD = get_env_variable("AUTH_LDAP_UID_FIELD")
AUTH_LDAP_BIND_USER = get_env_variable("AUTH_LDAP_BIND_USER")
AUTH_LDAP_BIND_PASSWORD = get_env_variable("AUTH_LDAP_BIND_PASSWORD")
