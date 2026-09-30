"""
Preprocessing for the Kaggle "Credit Risk Dataset" (person_income,
loan_amnt, etc). Download it into data/raw/credit_risk_dataset.csv first:
https://www.kaggle.com/datasets/laotse/credit-risk-dataset
"""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
import os

RAW_PATH = "data/raw/credit_risk_dataset.csv"
PROCESSED_DIR = "data/processed"

NUMERICAL_FEATURES = [
    "person_age",
    "person_income",
    "person_emp_length",
    "loan_amnt",
    "loan_int_rate",
    "loan_percent_income",
    "cb_person_cred_hist_length",
]
CATEGORICAL_FEATURES = [
    "person_home_ownership",
    "loan_intent",
    "cb_person_default_on_file",
]
TARGET = "loan_status"  # 1 = defaulted / bad risk, 0 = good risk

# loan_grade is dropped on purpose: it's a risk grade the lender assigns
# AFTER underwriting, so training on it leaks the answer — the model
# would look great here and fail in the real world where you don't have
# a bank's internal grade before you've made the decision.
DROP_COLS = ["loan_grade"]


def load_data(path: str = RAW_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.drop(columns=[c for c in DROP_COLS if c in df.columns])
    return df


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])
    return ColumnTransformer([
        ("num", numeric_pipeline, NUMERICAL_FEATURES),
        ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
    ])


def split_data(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]
    return train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )


if __name__ == "__main__":
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df = load_data()
    print(f"Loaded {len(df)} rows. Class balance: {df[TARGET].value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = split_data(df)
    joblib.dump((X_train, X_test, y_train, y_test), f"{PROCESSED_DIR}/split.pkl")
    print(f"Train: {len(X_train)} rows, Test: {len(X_test)} rows")
    print(f"Saved split to {PROCESSED_DIR}/split.pkl")
