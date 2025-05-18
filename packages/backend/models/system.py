from ..database import db

class System(db.Model):
    __tablename__ = 'systems'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<System id={self.id} name={self.name}>"
