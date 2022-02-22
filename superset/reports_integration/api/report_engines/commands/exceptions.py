
from flask_babel import lazy_gettext as _
from marshmallow.validate import ValidationError

from superset.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    UpdateFailedError,
    ForbiddenError
)


class ReportEngineInvalidError(CommandInvalidError):
    message = _("Reports Engine parameters are invalid.")


class ReportEngineRequiredFieldValidationError(ValidationError):
    def __init__(self, field_name: str) -> None:
        super().__init__(
            [_("Field is required")], field_name=field_name,
        )


class ReportEngineNotFoundError(CommandException):
    message = _("Reports Engine not founc.")


class ReportEngineDeleteFailedError(DeleteFailedError):
    message = _("Reports Engine could not be deleted")


class ReportEngineCreateFailedError(CreateFailedError):
    message = _("Reports Engine could not be created")


class ReportEngineUpdateFailedError(UpdateFailedError):
    message = _("Reports Engine could not be updated")


class ReportEngineForbiddenError(ForbiddenError):
    message = _("Changing this report is forbidden")


