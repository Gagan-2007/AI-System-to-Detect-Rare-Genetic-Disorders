from flask import Flask, request, jsonify
import requests
from main import predict_from_json

app = Flask(__name__)

# Backend endpoint where prediction must be sent
BACKEND_URL = "http://localhost:8000/api/v1/genetic-data/update-prediction"

@app.route("/predict", methods=["POST"])
def predict():
    input_json = request.get_json()

    # Validate required fields
    if not input_json or "gene" not in input_json or "mutation" not in input_json:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "Missing 'gene' or 'mutation'"
        }), 400

    try:
        # Get prediction from model
        prediction = predict_from_json(input_json)
        # prediction format expected:
        # {
        #   "user_id": "...",
        #   "prediction": "Sickle Cell"
        # }

        # 🔥 Send prediction to backend
        backend_response = requests.post(BACKEND_URL, json=prediction)

        # Optional debug
        print("Sent to backend:", prediction)
        print("Backend response:", backend_response.text)

        return jsonify({
            "status": "success",
            "data": prediction,
            "message": "Prediction generated and sent to backend successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)