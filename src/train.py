"""
Trains Logistic Regression, Random Forest, and XGBoost on the new
income/loan-amount dataset, compares them, and saves the best pipeline
(preprocessing + model bundled together) as one file.

Run preprocess.py first to generate data/processed/split.pkl.
"""
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, recall_score, f1_score, roc_auc_score
import os

from preprocess import build_preprocessor

X_train, X_test, y_train, y_test = joblib.load("data/processed/split.pkl")

MODELS = {
    "logistic_regression": LogisticRegression(max_iter=1000),
    "random_forest": RandomForestClassifier(n_estimators=300, random_state=42),
    "xgboost": XGBClassifier(eval_metric="logloss", random_state=42),
}

results = {}
best_pipeline = None
best_auc = -1
best_name = None

for name, clf in MODELS.items():
    pipe = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("classifier", clf),
    ])
    pipe.fit(X_train, y_train)

    preds = pipe.predict(X_test)
    probs = pipe.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, preds)
    bad_recall = recall_score(y_test, preds, pos_label=1)  # catching actual defaults
    f1 = f1_score(y_test, preds, pos_label=1)
    auc = roc_auc_score(y_test, probs)

    # sanity check against a baseline that always predicts the majority class —
    # see this printed alongside your real score, don't skip this comparison
    baseline_acc = max(y_test.mean(), 1 - y_test.mean())

    results[name] = {"accuracy": acc, "bad_recall": bad_recall, "f1": f1, "auc": auc}
    print(
        f"{name:20s} accuracy={acc:.4f}  bad_recall={bad_recall:.4f}  "
        f"f1={f1:.4f}  auc={auc:.4f}  (baseline acc={baseline_acc:.4f})"
    )

    if auc > best_auc:
        best_auc = auc
        best_pipeline = pipe
        best_name = name

print(f"\nBest model: {best_name} (AUC={best_auc:.4f})")

os.makedirs("models", exist_ok=True)
joblib.dump(best_pipeline, "models/best_credit_risk_model.pkl")
print("Saved to models/best_credit_risk_model.pkl")
print(
    "\nNote: this .pkl now contains preprocessing + model together, so "
    "api.py can call .predict_proba() directly on a raw DataFrame — no "
    "separate encoder/scaler handling needed at inference time."
)
