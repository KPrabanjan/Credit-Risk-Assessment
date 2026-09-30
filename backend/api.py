import os

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from schemas import validate_payload
except ImportError:
    from backend.schemas import validate_payload

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(ROOT, "models", "best_credit_risk_model.pkl")

app = Flask(__name__)
CORS(app)  # local dev only; restrict to your frontend's origin in production
model = joblib.load(MODEL_PATH)

FEATURE_ORDER = [
    "person_age", "person_income", "person_home_ownership", "person_emp_length",
    "loan_intent", "loan_amnt", "loan_int_rate", "loan_percent_income",
    "cb_person_default_on_file", "cb_person_cred_hist_length",
]

# Decision cutoffs on the default probability. Tune these to your risk appetite.
APPROVE_BELOW = 0.25
DECLINE_FROM = 0.50


def decide(bad_probability):
    if bad_probability < APPROVE_BELOW:
        return "APPROVED"
    if bad_probability < DECLINE_FROM:
        return "REVIEW"
    return "DECLINED"


def key_factors(d):
    """Simple rule-based explanation of the inputs. Not a model explanation."""
    f = []
    lpi = d["loan_percent_income"]
    if lpi > 0.30:
        f.append(("risk", f"Loan is {lpi:.0%} of annual income"))
    elif lpi <= 0.15:
        f.append(("strength", f"Loan is only {lpi:.0%} of annual income"))
    if d["cb_person_default_on_file"] == "Y":
        f.append(("risk", "Past default on credit file"))
    else:
        f.append(("strength", "No past default on file"))
    if d["person_home_ownership"] == "RENT":
        f.append(("risk", "Renting, which shows higher default rates in the data"))
    elif d["person_home_ownership"] in ("OWN", "MORTGAGE"):
        f.append(("strength", "Owns or is paying off a home"))
    if d["loan_int_rate"] > 14:
        f.append(("risk", f"High interest rate ({d['loan_int_rate']}%)"))
    elif d["loan_int_rate"] < 9:
        f.append(("strength", f"Low interest rate ({d['loan_int_rate']}%)"))
    if d["person_emp_length"] < 1:
        f.append(("risk", "Less than a year in current job"))
    elif d["person_emp_length"] >= 5:
        f.append(("strength", f"{d['person_emp_length']:g} years in current job"))
    return [{"type": t, "text": s} for t, s in f[:4]]


@app.route("/")
def home():
    return {"status": "Credit Risk API is running"}


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"errors": ["Request body must be valid JSON."]}), 400
    errors = validate_payload(data)
    if errors:
        return jsonify({"errors": errors}), 400

    data = dict(data)
    data["loan_percent_income"] = data["loan_amnt"] / data["person_income"]  # computed here, never trusted from the client
    row = pd.DataFrame([{k: data[k] for k in FEATURE_ORDER}])
    bad = float(model.predict_proba(row)[0][1])

    return jsonify({
        "decision": decide(bad),
        "bad_probability": bad,
        "good_probability": 1 - bad,
        "loan_percent_income": data["loan_percent_income"],
        "factors": key_factors(data),
        "thresholds": {"approve_below": APPROVE_BELOW, "decline_from": DECLINE_FROM},
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
