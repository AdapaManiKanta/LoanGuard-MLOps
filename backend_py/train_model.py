import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression

if not os.path.exists("models"):
    os.makedirs("models")

data = pd.read_csv("data/loan_data.csv")

if "Loan_ID" in data.columns:
    data.drop("Loan_ID", axis=1, inplace=True)

for col in data.select_dtypes(include="object").columns:
    data[col] = data[col].fillna(data[col].mode()[0])

for col in data.select_dtypes(include="number").columns:
    data[col] = data[col].fillna(data[col].median())

data["Loan_Status"] = data["Loan_Status"].map({"Y":1,"N":0})

label_encoders = {}
for col in data.select_dtypes(include="object").columns:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    label_encoders[col] = le

X = data.drop("Loan_Status", axis=1)
y = data["Loan_Status"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

joblib.dump(model, "models/loan_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")
joblib.dump(label_encoders, "models/label_encoders.pkl")

print("Model Trained & Saved Successfully")
