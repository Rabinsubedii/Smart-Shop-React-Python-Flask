from flask import Flask
from flask_cors import CORS
from config import Config
from extension import db, bcrypt, jwt, migrate

from flask import send_from_directory
import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    import models

    from routes import api
    app.register_blueprint(api, url_prefix="/api")

    @app.route("/uploads/<filename>")
    def uploaded_file(filename):
        upload_folder = os.path.join(app.root_path, "uploads")
        return send_from_directory(upload_folder, filename)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)