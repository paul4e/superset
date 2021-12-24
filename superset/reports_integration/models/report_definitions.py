from flask_appbuilder import Model
from superset.models.helpers import AuditMixinNullable
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    LargeBinary,
    Table,
    ForeignKey
)
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.orm import relationship
from superset import security_manager

metadata = Model.metadata  # pylint: disable=no-member

report_definition_user = Table(
    "report_definition_user",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("ab_user.id")),
    Column("report_definition_id", Integer, ForeignKey("report_definitions.id")),
    UniqueConstraint("report_definition_id", "user_id"),
)


class ReportDefinition(Model, AuditMixinNullable):

    """An ORM object that stores ReportDefinition related information"""
    __tablename__ = "report_definitions"
    __table_args__ = (UniqueConstraint("report_name"),)

    id = Column(Integer, primary_key=True)
    report_name = Column(String(250), nullable=False)
    report_title = Column(String(250))
    parameters = Column(Text)
    report_definition = Column(LargeBinary, nullable=False)
    owners = relationship(security_manager.user_model, secondary=report_definition_user)

    def __repr__(self) -> str:
        return f"{self.report_name} {self.report_title}"

    @property
    def changed_by_name(self) -> str:
        if not self.changed_by:
            return ""
        return str(self.changed_by)

    @property
    def changed_by_url(self) -> str:
        if not self.changed_by:
            return ""
        return f"/superset/profile/{self.changed_by.username}"

    @property
    def url(self) -> str:
        return f"/report_definitions/report/{self.id}"
