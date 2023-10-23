from flask import Flask, request, send_from_directory
from flask_cors import CORS

from blender_script import main
import subprocess

app = Flask(__name__)
CORS(app)

GLB_DIRECTORY = 'models'  # Replace with the path to your GLB files directory


@app.route("/data")
def home():
    return {"Name": "geek"}


@app.route("/prescription", methods=["POST"])
def prescription_input():
    prescription = request.get_json()
    print(prescription)
    if float(prescription["SPH_OD"]) == 0.0 or float(prescription["SPH_OS"]) == 0.0:
        return "Invalid Prescription", 400
    subprocess.run(["python3.10", "backend/blender_script/main.py", prescription["SPH_OD"], prescription["SPH_OS"], prescription["FRAME_ID"]])
    return "Done", 201


@app.route('/get-model/<filename>', methods=['GET'])
def get_glb(filename):
    return send_from_directory(GLB_DIRECTORY, filename)


if __name__ == "__main__":
    app.run(port=5100)
