import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    # PostgreSQL Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:root@localhost:5432/ecommerce_db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "local-jwt-secret-key"
    )

    # Flask Secret Key
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "local-flask-secret-key"
    )

    # Upload Folder
    UPLOAD_FOLDER = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "uploads"
    )

    # Maximum upload size (10 MB)
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024