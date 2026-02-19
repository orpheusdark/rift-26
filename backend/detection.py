import networkx as nx
from collections import defaultdict
from datetime import timedelta
import numpy as np


def build_graph(transactions):
    graph = nx.DiGraph()

    for tx in transactions:
        sender = tx["sender_id"]
        receiver = tx["receiver_id"]
        amount = tx["amount"]

        if graph.has_edge(sender, receiver):
            graph[sender][receiver]["weight"] += amount
        else:
            graph.add_edge(sender, receiver, weight=amount)

    return graph


def compute_flow_metrics(transactions):
    incoming_amount = defaultdict(float)
    outgoing_amount = defaultdict(float)
    tx_count = defaultdict(int)

    for tx in transactions:
        sender = tx["sender_id"]
        receiver = tx["receiver_id"]
        amount = tx["amount"]

        outgoing_amount[sender] += amount
        incoming_amount[receiver] += amount
        tx_count[sender] += 1
        tx_count[receiver] += 1

    metrics = {}

    all_accounts = set(list(incoming_amount.keys()) + list(outgoing_amount.keys()))

    for acc in all_accounts:
        metrics[acc] = {
            "incoming_total": incoming_amount[acc],
            "outgoing_total": outgoing_amount[acc],
            "net_flow": incoming_amount[acc] - outgoing_amount[acc],
            "transaction_count": tx_count[acc]
        }

    return metrics


def detect_cycles(graph, max_cycle_length=6):
    cycles = list(nx.simple_cycles(graph))
    return [c for c in cycles if len(c) <= max_cycle_length]


def detect_smurfing(transactions, threshold=5):
    sender_counts = defaultdict(int)
    for tx in transactions:
        sender_counts[tx["sender_id"]] += 1

    return [s for s, c in sender_counts.items() if c >= threshold]


def detect_shell_accounts(transactions, min_transactions=3):
    incoming = defaultdict(int)
    outgoing = defaultdict(int)

    for tx in transactions:
        incoming[tx["receiver_id"]] += 1
        outgoing[tx["sender_id"]] += 1

    shells = []

    for acc in set(list(incoming.keys()) + list(outgoing.keys())):
        total = incoming[acc] + outgoing[acc]

        if total <= min_transactions and (
            incoming[acc] == 0 or outgoing[acc] == 0
        ):
            shells.append(acc)

    return shells


def detect_high_velocity(transactions, window_minutes=10, threshold=4):
    tx_by_sender = defaultdict(list)

    for tx in transactions:
        tx_by_sender[tx["sender_id"]].append(tx["timestamp"])

    suspicious = []

    for sender, timestamps in tx_by_sender.items():
        timestamps.sort()

        start_idx = 0
        for end_idx in range(len(timestamps)):
            # Shrink window from the left if the time difference exceeds the window
            while timestamps[end_idx] - timestamps[start_idx] > timedelta(minutes=window_minutes):
                start_idx += 1
            
            # Check if the count of transactions in the current window meets the threshold
            if end_idx - start_idx + 1 >= threshold:
                suspicious.append(sender)
                break

    return suspicious


def detect_amount_anomalies(transactions, z_threshold=2.0):
    amounts = [tx["amount"] for tx in transactions]

    if len(amounts) < 2:
        return []

    mean = np.mean(amounts)
    std = np.std(amounts)

    if std == 0:
        return []

    anomalous_accounts = set()

    for tx in transactions:
        z_score = (tx["amount"] - mean) / std
        if z_score >= z_threshold:
            anomalous_accounts.add(tx["sender_id"])

    return list(anomalous_accounts)


def compute_pagerank(graph):
    return nx.pagerank(graph, weight="weight")
