# from superset.reports_integration.models.report_engines import ReportEngineTypes
from marshmallow import fields, Schema, validate
from marshmallow.validate import Length

verbose_name_description = "verbose_name_description"
reports_engine_type_description = "reports_engine_type_description"


class ReportEnginesPostSchema(Schema):
    verbose_name = fields.String(required=True, description=verbose_name_description,
                                 validate=Length(1, 250))
    reports_engine_type = fields.String(required=True,
                                        description=reports_engine_type_description,
                                        validate=validate.OneOf(["BIRT"]))
    description = fields.String(allow_none=True)
    owners = fields.List(fields.Integer())


class ReportEnginesPutSchema(Schema):
    verbose_name = fields.String(required=True, description=verbose_name_description,
                                 validate=Length(1, 250))
    description = fields.String(allow_none=True)
    owners = fields.List(fields.Integer())


class ValidateReportSchema(Schema):
    report_definition = fields.String(required=True)
    report_name = fields.String(required=True, validate=Length(1, 250))

