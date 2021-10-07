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

from flask_babel import _

from superset.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    ForbiddenError,
    ImportFailedError,
    UpdateFailedError,
)


class ActiveReportCreateFailedError(CreateFailedError):
    message = _("Active Report could not be created.")


class ActiveReportNotFoundError(CommandException):
    message = "Active Report not found."


class ActiveReportDeleteFailedError(DeleteFailedError):
    message = _("Active Report could not be deleted.")


class ActiveReportForbiddenError(ForbiddenError):
    message = _("Changing this Active Report is forbidden")


class ActiveReportUpdateFailedError(UpdateFailedError):
    message = _("Active Report could not be updated.")


class ActiveReportInvalidError(CommandInvalidError):
    message = _("Active Report parameters are invalid.")


class ActiveReportForbiddenError(ForbiddenError):
    message = _("Changing this Report is forbidden.")
