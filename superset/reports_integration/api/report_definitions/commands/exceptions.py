from flask_babel import lazy_gettext as _
from marshmallow.validate import ValidationError

from superset.commands.exceptions import (
    CommandException,
    CommandInvalidError,
    CreateFailedError,
    DeleteFailedError,
    UpdateFailedError,
    ForbiddenError,
)

from superset.exceptions import SupersetErrorException, SupersetErrorsException


class ReportDefinitionInvalidError(CommandInvalidError):
    message = _("Reports Definition parameters are invalid.")


class ReportDefinitionRequiredFieldValidationError(ValidationError):
    def __init__(self, field_name: str) -> None:
        super().__init__(
            [_("Field is required")], field_name=field_name,
        )


class ReportDefinitionNotFoundError(CommandException):
    message = _("Report Definition not found.")


class ReportDefitinionDeleteFailedError(DeleteFailedError):
    message = _("Report Definition could not be deleted")


class ReportDefinitionCreateFailedError(CreateFailedError):
    message = _("Report Definition could not be created")


class ReportDefinitionUpdateFailedError(UpdateFailedError):
    message = _("Report Definition could not be updated")


class ReportDefinitionForbiddenError(ForbiddenError):
    message = _("Changing this report is forbidden")
