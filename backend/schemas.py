"""Validation for /predict. Ranges match the data the model was trained on."""

RANGES = {
    "person_age": (18, 100),
    "person_emp_length": (0, 60),
    "loan_int_rate": (5, 24),
    "cb_person_cred_hist_length": (0, 40),
}
# Amounts are in rupees and may be any positive value. The API flags amounts
# that fall outside the range the model was trained on.
POSITIVE = {"person_income": "Annual income", "loan_amnt": "Loan amount"}
MAX_AMOUNT = 10 ** 13
CHOICES = {
    "person_home_ownership": {"RENT", "OWN", "MORTGAGE", "OTHER"},
    "loan_intent": {"EDUCATION", "MEDICAL", "VENTURE", "PERSONAL",
                    "DEBTCONSOLIDATION", "HOMEIMPROVEMENT"},
    "cb_person_default_on_file": {"Y", "N"},
}


def validate_payload(data):
    if not isinstance(data, dict):
        return ["Request body must be a JSON object."]
    errors = []
    for field, (lo, hi) in RANGES.items():
        v = data.get(field)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or v != v:
            errors.append(f"{field} must be a number.")
        elif not lo <= v <= hi:
            errors.append(f"{field} must be between {lo:,} and {hi:,} (the range the model was trained on).")
    for field, label in POSITIVE.items():
        v = data.get(field)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or v != v:
            errors.append(f"{label} must be a number.")
        elif not 1 <= v <= MAX_AMOUNT:
            errors.append(f"{label} must be greater than 0.")
    for field, allowed in CHOICES.items():
        if data.get(field) not in allowed:
            errors.append(f"{field} must be one of {sorted(allowed)}.")
    return errors