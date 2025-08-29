from sqlalchemy import Column, Integer, String, Text
from ..database import Base

class System(Base):
    __tablename__ = 'systems'

    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    def __repr__(self):
        return f"<System id={self.id} name={self.name}>"
