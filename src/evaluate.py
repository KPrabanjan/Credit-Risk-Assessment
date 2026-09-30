import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    ConfusionMatrixDisplay
)

import matplotlib.pyplot as plt


# Load dataset
df = pd.read_csv("data/raw/german_credit_data.csv")


# Remove unnecessary column
df = df.drop(columns=["Unnamed: 0"])


# Handle missing values
categorical_columns = [
    "Sex",
    "Housing",
    "Saving accounts",
    "Checking account",
    "Purpose"
]

df[categorical_columns] = df[categorical_columns].fillna("Unknown")


# Separate features and target
X = df.drop(columns=["Risk"])

y = df["Risk"].map({
    "bad": 0,
    "good": 1
})


# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Load trained model
model = joblib.load("models/best_credit_risk_model.pkl")


# Make predictions
y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)[:, 1]


# Accuracy
accuracy = accuracy_score(y_test, y_pred)

print("Model Evaluation")
print("================")

print(f"\nAccuracy: {accuracy:.4f}")


# Classification report
print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["bad", "good"]
    )
)


# Confusion matrix
cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(cm)


# ROC-AUC
roc_auc = roc_auc_score(y_test, y_probability)

print(f"\nROC-AUC Score: {roc_auc:.4f}")


# Display confusion matrix
disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=["bad", "good"]
)

disp.plot()

plt.title("XGBoost Credit Risk Confusion Matrix")
plt.show()
# Feature Importance
print("\nFeature Importance:")

preprocessor = model.named_steps["preprocessor"]
classifier = model.named_steps["classifier"]

feature_names = preprocessor.get_feature_names_out()

importance = classifier.feature_importances_

feature_importance = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importance
})

feature_importance = feature_importance.sort_values(
    by="Importance",
    ascending=False
)

print(feature_importance.head(15))