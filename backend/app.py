import os

from flask import Flask, send_from_directory
from flask_cors import CORS

from config import Config
from extension import db, bcrypt, jwt, migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allows localhost during development and Vercel after deployment.
    # Multiple URLs can be supplied as a comma-separated string.
    frontend_urls = os.getenv(
        "FRONTEND_URLS",
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    allowed_origins = [
        url.strip()
        for url in frontend_urls.split(",")
        if url.strip()
    ]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins
            },
            r"/uploads/*": {
                "origins": allowed_origins
            }
        },
        supports_credentials=False
    )

    # Initialize Flask extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Load database models before migrations/routes
    import models

    # Register API blueprint
    from routes import api
    app.register_blueprint(api, url_prefix="/api")

    # Simple deployment health check
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {
            "status": "ok",
            "message": "Smart E-commerce API is running"
        }, 200

    # Serve uploaded product images
    @app.route("/uploads/<path:filename>", methods=["GET"])
    def uploaded_file(filename):
        upload_folder = app.config["UPLOAD_FOLDER"]

        return send_from_directory(
            upload_folder,
            filename
        )

    return app


# Gunicorn loads this variable using: app:app
app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true"
    )