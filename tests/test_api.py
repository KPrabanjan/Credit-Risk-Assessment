import requests

url = "http://127.0.0.1:5000/predict"

customer = {
    "person_age": 30,
    "person_income": 600000,
    "person_home_ownership": "RENT",
    "person_emp_length": 3,
    "loan_intent": "PERSONAL",
    "loan_amnt": 200000,
    "loan_int_rate": 11.5,
    "loan_percent_income": 0.33,
    "cb_person_default_on_file": "N",
    "cb_person_cred_hist_length": 4,
}

try:
    response = requests.post(url, json=customer, timeout=5)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("API not reachable yet (start Flask with python backend/api.py):", e)