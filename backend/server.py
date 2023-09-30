from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/data")
def home():
    return {"Name": "geek"}


@app.route("/prescription", methods=["POST"])
def prescription_input():
    prescription = request.get_json()
    print(prescription)
    return "Done", 201


if __name__ == "__main__":
    app.run(port=5100)
