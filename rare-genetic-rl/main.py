# ================================
# MAIN PIPELINE - GENETIC MODEL
# ================================

import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score
from rl.rl_agent import RLAgent

# ================================
# 1. LOAD DATASET
# ================================

df = pd.read_excel("data/processed/genetic_disorders_dataset.xlsx")

print(" Dataset Loaded")
print("Shape:", df.shape)
print("Columns:", df.columns)

# ================================
# 2. PREPROCESSING
# ================================

gene_encoder = LabelEncoder()
mutation_encoder = LabelEncoder()
label_encoder = LabelEncoder()

df["Gene_encoded"] = gene_encoder.fit_transform(df["Gene"])
df["Mutation_encoded"] = mutation_encoder.fit_transform(df["Mutation"])
df["Target"] = label_encoder.fit_transform(df["Genetic Disorder"])

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
# 4. INITIAL MODEL TRAINING
# ================================

initial_model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    use_label_encoder=False,
    eval_metric='mlogloss'
)

initial_model.fit(X_train, y_train)
scores = cross_val_score(initial_model, X_train, y_train, cv=5)
starting_accuracy = scores.mean()

print(f"Starting Accuracy: {starting_accuracy:.4f}")

# ================================
# 5. RL SETUP
# ================================

actions = [
    (5, 0, 0.0),
    (-5, 0, 0.0),
    (0, 1, 0.0),
    (0, -1, 0.0),
    (0, 0, 0.01),
    (0, 0, -0.01),
    (5, 1, 0.01),
    (-5, -1, -0.01)
]

rl_agent = RLAgent(actions)

state = [starting_accuracy, 0]
current_params = {"n_estimators": 100, "max_depth": 5, "learning_rate": 0.1}

# ================================
# 6. RL TRAINING
# ================================

num_episodes = 10

for ep in range(1, num_episodes + 1):
    action_idx = rl_agent.select_action(state)
    action = actions[action_idx]

    current_params["n_estimators"] = max(10, current_params["n_estimators"] + action[0])
    current_params["max_depth"] = max(1, current_params["max_depth"] + action[1])
    current_params["learning_rate"] = max(0.01, current_params["learning_rate"] + action[2])

    model = XGBClassifier(
        n_estimators=current_params["n_estimators"],
        max_depth=current_params["max_depth"],
        learning_rate=current_params["learning_rate"],
        random_state=42,
        use_label_encoder=False,
        eval_metric='mlogloss'
    )

    model.fit(X_train, y_train)
    scores = cross_val_score(model, X_train, y_train, cv=5)
    accuracy = scores.mean()

    reward = (accuracy - state[0]) * 100

    next_state = [accuracy, action_idx]
    rl_agent.update(state, action_idx, reward, next_state)

    state = next_state

    print(f"Episode {ep}: Accuracy={accuracy:.4f}")

# ================================
# 7. FINAL EVALUATION
# ================================

y_pred = model.predict(X_test)

print("\n Accuracy:", accuracy_score(y_test, y_pred))
print("\n Classification Report:\n")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# ================================
# 8. PREDICTION FUNCTIONS
# ================================

def predict_disorder(gene, mutation):
    gene = gene.strip().upper()
    mutation = mutation.strip()

    gene_val = gene_encoder.transform([gene])[0]
    mutation_val = mutation_encoder.transform([mutation])[0]

    input_df = pd.DataFrame(
        [[gene_val, mutation_val]],
        columns=["Gene_encoded", "Mutation_encoded"]
    )

    pred = model.predict(input_df)
    result = label_encoder.inverse_transform(pred)

    return result[0]


def predict_from_json(input_json):
    gene = input_json["gene"]
    mutation = input_json["mutation"]

    result = predict_disorder(gene, mutation)

    return {
        "user_id": input_json.get("user_id", ""),
        "prediction": result
    }

# ================================
# 9. TEST
# ================================

sample_input = {
    "user_id": "test123",
    "gene": "HBB",
    "mutation": "E6V"
}

print("\n JSON Prediction:")
print(predict_from_json(sample_input))