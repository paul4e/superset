
from flask_appbuilder import Model
from superset.models.helpers import AuditMixinNullable
import enum

from sqlalchemy import (
    Boolean,
    Column,
    create_engine,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    Enum
)
from superset.reports_integration.models.report_definitions import ReportDefinition
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.orm import relationship
from superset import security_manager


class ReportEngineTypes(enum.Enum):

    """Supported Report engines types."""

    BIRT = "BIRT"


metadata = Model.metadata  # pylint: disable=no-member

report_definition_engine = Table(
    "report_definition_engine",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("report_engine_id", Integer, ForeignKey("report_engines.id")),
    Column("report_definition_id", Integer, ForeignKey("report_definitions.id")),
    UniqueConstraint("report_engine_id", "report_definition_id"),
)

report_engine_user = Table(
    "report_engine_user",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, ForeignKey("ab_user.id")),
    Column("report_engine_id", Integer, ForeignKey("report_engines.id")),
    UniqueConstraint("report_engine_id", "user_id"),
)


class ReportEngine(Model, AuditMixinNullable):

    """An ORM object that stores ReportEngine related information"""

    __tablename__ = "report_engines"
    __table_args__ = (UniqueConstraint("verbose_name"),)

    id = Column(Integer, primary_key=True)
    verbose_name = Column(String(250), unique=True)
    report_definitions = relationship(ReportDefinition,
                                      secondary=report_definition_engine,
                                      backref="engines")
    description = Column(Text)
    owners = relationship(security_manager.user_model, secondary=report_engine_user)
    reports_engine_type = Column(Enum(ReportEngineTypes))

    def __repr__(self) -> str:
        return str(self.verbose_name)

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
        return f"/report_engines/engine/{self.id}"


