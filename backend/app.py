import os

from flask import Flask, send_from_directory
from flask_cors import CORS

from config import Config
from extension import db, bcrypt, jwt, migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    frontend_urls = os.getenv(
        "FRONTEND_URLS",
        (
            "https://smart-shop-react-python-flask.vercel.app,"
            "http://localhost:5173,"
            "http://127.0.0.1:5173"
        )
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
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
                "https://smart-shop-react-python-flask.vercel.app"
            ]
        }
    },
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    import models

    from routes import api
    app.register_blueprint(api, url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {
            "status": "ok",
            "message": "Smart E-commerce API is running"
        }, 200

    @app.route("/uploads/<path:filename>", methods=["GET"])
    def uploaded_file(filename):
        return send_from_directory(
            app.config["UPLOAD_FOLDER"],
            filename
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true"
    )