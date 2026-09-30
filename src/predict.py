import pandas as pd
import joblib

model = joblib.load("models/best_credit_risk_model.pkl")

customer = pd.DataFrame([{
    "person_age": 30,
    "person_income": 600000,
    "person_home_ownership": "RENT",
    "person_emp_length": 3,
    "loan_intent": "PERSONAL",
    "loan_amnt": 200000,
    "loan_int_rate": 11.5,
    "loan_percent_income": 200000 / 600000,
    "cb_person_default_on_file": "N",
    "cb_person_cred_hist_length": 4,
}])

prediction = model.predict(customer)[0]
probability = model.predict_proba(customer)[0]

risk = "BAD" if prediction == 1 else "GOOD"

print("Credit Risk Prediction")
print("======================")
print(f"Predicted Risk: {risk}")
print(f"Bad Risk Probability:  {probability[1] * 100:.2f}%")
print(f"Good Risk Probability: {probability[0] * 100:.2f}%")
