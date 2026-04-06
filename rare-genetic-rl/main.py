# ================================
# MAIN PIPELINE - GENETIC MODEL
# ================================

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# ================================
# 1. LOAD DATASET
# ================================

df = pd.read_excel("data/processed/genetic_disorders_dataset.xlsx")

print(" Dataset Loaded")
print("Shape:", df.shape)
print("Columns:", df.columns)
print(df.head())

# ================================
# 2. PREPROCESSING
# ================================

# Encode Gene and Mutation (input features)
gene_encoder = LabelEncoder()
mutation_encoder = LabelEncoder()

df["Gene_encoded"] = gene_encoder.fit_transform(df["Gene"])
df["Mutation_encoded"] = mutation_encoder.fit_transform(df["Mutation"])

# Encode target label
label_encoder = LabelEncoder()
df["Target"] = label_encoder.fit_transform(df["Genetic Disorder"])

# Features and target
X = df[["Gene_encoded", "Mutation_encoded"]]
y = df["Target"]

print("\n Preprocessing Done")
print("Classes:", label_encoder.classes_)

# ================================
# 3. TRAIN TEST SPLIT
# ================================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("\n Data Split Done")

# ================================
# 4. TRAIN MODEL (XGBoost)
# ================================

from xgboost import XGBClassifier

model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    use_label_encoder=False,
    eval_metric='mlogloss'
)

model.fit(X_train, y_train)

print("\n Model Training Complete (XGBoost)")

# ================================
# 5. EVALUATION
# ================================

y_pred = model.predict(X_test)

print("\n Accuracy:", accuracy_score(y_test, y_pred))
print("\n Classification Report:\n")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# ================================
# 6. PREDICTION FUNCTIONS
# ================================

def predict_disorder(gene, mutation):
    gene_val = gene_encoder.transform([gene])[0]
    mutation_val = mutation_encoder.transform([mutation])[0]

    # FIX: use DataFrame to avoid warning
    input_df = pd.DataFrame([[gene_val, mutation_val]],
                            columns=["Gene_encoded", "Mutation_encoded"])

    pred = model.predict(input_df)
    result = label_encoder.inverse_transform(pred)

    return result[0]


# ✅ NEW: JSON handler (for backend/frontend)
def predict_from_json(input_json):
    gene = input_json["gene"]
    mutation = input_json["mutation"]

    result = predict_disorder(gene, mutation)

    return {
        "user_id": input_json["user_id"],
        "prediction": result
    }


# ================================
# 7. TESTS
# ================================

# Old sample test
print("\n Sample Prediction:")
print(predict_disorder("CFTR", "ΔF508"))

# ✅ NEW: JSON test
sample_input = {
    "user_id": "test_user",
    "category": "genetic",
    "gene": "HBB",
    "mutation": "E6V",
    "mutation_present": 1,
    "age": 12,
    "hemoglobin_level": 9.5,
    "rbc_count": 3.2,
    "symptoms": {
        "fatigue": 1,
        "pain": 1
    }
}

print("\n JSON Prediction:")
print(predict_from_json(sample_input))