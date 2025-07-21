from rest_framework.decorators import api_view
from rest_framework.response import Response
from sklearn.cluster import KMeans
import pandas as pd
from appwrite.client import Client
from appwrite.services.databases import Databases

client = Client().set_endpoint("https://fra.cloud.appwrite.io/v1").set_project("grading-system").set_key("your-secret-api-key")
database = Databases(client)

DATABASE_ID = "grading-db"
COLLECTION_SCORES = "score-id"
COLLECTION_ASSESSMENTS = "assessment-id"

def fetch_data():
    scores = database.list_documents(DATABASE_ID, COLLECTION_SCORES).get('documents', [])
    assessments = database.list_documents(DATABASE_ID, COLLECTION_ASSESSMENTS).get('documents', [])
    return pd.DataFrame(scores), pd.DataFrame(assessments)

@api_view(['GET'])
def cluster_students(request):
    scores_df, assess_df = fetch_data()

    # Preprocessing (Example: weighted score)
    scores_df["weighted_score"] = scores_df["score"] * (scores_df["weight"] / 100)

    features_df = scores_df.groupby("student_id").agg({
        "weighted_score": "sum",
        "score": ["mean", "count"]
    })
    features_df.columns = ["total_weighted_score", "avg_score", "completion_ratio"]
    features_df = features_df.dropna()

    # Clustering
    kmeans = KMeans(n_clusters=3, random_state=0).fit(features_df)
    features_df["cluster"] = kmeans.labels_

    return Response(features_df.reset_index().to_dict(orient="records"))
