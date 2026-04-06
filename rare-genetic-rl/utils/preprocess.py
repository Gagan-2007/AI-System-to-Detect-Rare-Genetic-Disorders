import pandas as pd

TARGET_DISEASES = [
    "Thalassemia",
    "Sickle Cell Anemia",
    "Cystic Fibrosis"
]

def load_data():
    df = pd.read_csv("data/raw/train_genetic_disorders.csv")
    return df

def preprocess(df):
    # drop rows with missing target
    df = df.dropna(subset=["Genetic Disorder"])

    # filter only required diseases
    df = df[df["Genetic Disorder"].isin(TARGET_DISEASES)]

    # separate target BEFORE encoding
    y = df["Genetic Disorder"]

    # drop useless columns
    drop_cols = [col for col in df.columns if "id" in col.lower() or "name" in col.lower()]
    df = df.drop(columns=drop_cols, errors="ignore")

    # drop target column from features
    X = df.drop(["Genetic Disorder", "Disorder Subclass"], axis=1, errors="ignore")

    # encode categorical features
    X = pd.get_dummies(X, drop_first=True)

    # encode target
    y = y.astype("category").cat.codes

    return X, y