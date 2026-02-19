from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import time
from io import StringIO
import os




from detection import (
    build_graph,
    compute_flow_metrics,
    detect_cycles,
    detect_smurfing,
    detect_shell_accounts,
    detect_high_velocity,
    detect_amount_anomalies,
    compute_pagerank
)

from scoring import generate_scores


app = FastAPI()

# ---- CORS Middleware ----
_cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------


@app.get("/")
def health_check():
    return {"status": "ok"}




















@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    start_time = time.time()

    contents = await file.read()
    df = pd.read_csv(StringIO(contents.decode("utf-8")))
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    transactions = df.to_dict(orient="records")

    graph = build_graph(transactions)

    cycles = detect_cycles(graph)
    smurfing = detect_smurfing(transactions)
    shells = detect_shell_accounts(transactions)
    velocity = detect_high_velocity(transactions)
    anomalies = detect_amount_anomalies(transactions)
    pagerank_scores = compute_pagerank(graph)
    flow_metrics = compute_flow_metrics(transactions)













    suspicious_accounts, fraud_rings = generate_scores(
        cycles,
        smurfing,
        shells,
        velocity,
        anomalies,
        pagerank_scores,
        flow_metrics
    )

    processing_time = round(time.time() - start_time, 2)

    graph_edges = [
        {"source": u, "target": v, "weight": d["weight"]}
        for u, v, d in graph.edges(data=True)








    ]


    return {

        "suspicious_accounts": suspicious_accounts,

        "fraud_rings": fraud_rings,

        "graph_edges": graph_edges,

        "summary": {
            "total_accounts_analyzed": len(graph.nodes()),


            "suspicious_accounts_flagged": len(suspicious_accounts),

            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": processing_time


        }
    }
