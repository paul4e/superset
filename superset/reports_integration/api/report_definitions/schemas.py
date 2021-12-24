from marshmallow import fields, Schema, validate
from marshmallow.validate import Length

report_name_description = ""
report_title_description = ""


# reports_engine_type_description = ""


class ReportDefinitionPostSchema(Schema):
    report_name = fields.String(required=True, description=report_name_description,
                                validate=Length(1, 250))
    report_title = fields.String(required=True, description=report_name_description,
                                 validate=Length(1, 250))
    report_definition = fields.String(required=True)
    owners = fields.List(fields.Integer())
    engines = fields.List(fields.String(required=True))


class ReportDefinitionPutSchema(Schema):
    report_name = fields.String(required=True, description=report_name_description,
                                validate=Length(1, 250))
    report_title = fields.String(required=True, description=report_name_description,
                                 validate=Length(1, 250))
