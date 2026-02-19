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


def detect_cycles(graph, min_cycle_length=3, max_cycle_length=5):
    cycles = list(nx.simple_cycles(graph))
    return [c for c in cycles if min_cycle_length <= len(c) <= max_cycle_length]


def detect_smurfing(transactions, fan_threshold=10, time_window_hours=72):
    """Detect fan-in (aggregators) and fan-out (dispersers) smurfing patterns.

    Fan-in: 10+ unique senders → 1 receiver (aggregation).
    Fan-out: 1 sender → 10+ unique receivers (dispersal).
    Temporal analysis: also checks within a 72-hour rolling window.

    Returns:
        dict with keys 'fan_in' (list of aggregator accounts) and
        'fan_out' (list of disperser accounts).
    """
    receiver_senders = defaultdict(set)
    sender_receivers = defaultdict(set)
    tx_by_receiver = defaultdict(list)
    tx_by_sender = defaultdict(list)

    for tx in transactions:
        receiver_senders[tx["receiver_id"]].add(tx["sender_id"])
        sender_receivers[tx["sender_id"]].add(tx["receiver_id"])
        tx_by_receiver[tx["receiver_id"]].append(tx)
        tx_by_sender[tx["sender_id"]].append(tx)

    fan_in = set()
    fan_out = set()

    # Global fan-in / fan-out (across all time)
    for acc, senders in receiver_senders.items():
        if len(senders) >= fan_threshold:
            fan_in.add(acc)
    for acc, receivers in sender_receivers.items():
        if len(receivers) >= fan_threshold:
            fan_out.add(acc)

    window = timedelta(hours=time_window_hours)

    # Temporal fan-in within rolling 72-hour window
    for receiver, txs in tx_by_receiver.items():
        if receiver in fan_in:
            continue
        txs_sorted = sorted(txs, key=lambda x: x["timestamp"])
        start_idx = 0
        sender_counts = {}
        for tx in txs_sorted:
            while txs_sorted[start_idx]["timestamp"] < tx["timestamp"] - window:
                old = txs_sorted[start_idx]["sender_id"]
                sender_counts[old] -= 1
                if sender_counts[old] == 0:
                    del sender_counts[old]
                start_idx += 1
            sid = tx["sender_id"]
            sender_counts[sid] = sender_counts.get(sid, 0) + 1
            if len(sender_counts) >= fan_threshold:
                fan_in.add(receiver)
                break

    # Temporal fan-out within rolling 72-hour window
    for sender, txs in tx_by_sender.items():
        if sender in fan_out:
            continue
        txs_sorted = sorted(txs, key=lambda x: x["timestamp"])
        start_idx = 0
        receiver_counts = {}
        for tx in txs_sorted:
            while txs_sorted[start_idx]["timestamp"] < tx["timestamp"] - window:
                old = txs_sorted[start_idx]["receiver_id"]
                receiver_counts[old] -= 1
                if receiver_counts[old] == 0:
                    del receiver_counts[old]
                start_idx += 1
            rid = tx["receiver_id"]
            receiver_counts[rid] = receiver_counts.get(rid, 0) + 1
            if len(receiver_counts) >= fan_threshold:
                fan_out.add(sender)
                break

    return {"fan_in": list(fan_in), "fan_out": list(fan_out)}


def detect_shell_accounts(transactions, max_transactions=3):
    """Detect shell (pass-through) accounts.

    Shell accounts are intermediate nodes that have BOTH incoming and outgoing
    transactions but very few total transactions (2–3), characteristic of
    layered shell networks where money passes through before reaching its
    final destination.
    """
    incoming = defaultdict(int)
    outgoing = defaultdict(int)

    for tx in transactions:
        incoming[tx["receiver_id"]] += 1
        outgoing[tx["sender_id"]] += 1

    shells = []

    for acc in set(list(incoming.keys()) + list(outgoing.keys())):
        total = incoming[acc] + outgoing[acc]
        # Shell: BOTH directions present, very low total transaction count
        if total <= max_transactions and incoming[acc] > 0 and outgoing[acc] > 0:
            shells.append(acc)

    return shells


def detect_high_velocity(transactions, window_hours=72, threshold=4):
    tx_by_sender = defaultdict(list)

    for tx in transactions:
        tx_by_sender[tx["sender_id"]].append(tx["timestamp"])

    suspicious = []

    for sender, timestamps in tx_by_sender.items():
        timestamps.sort()

        start_idx = 0
        for end_idx in range(len(timestamps)):
            # Shrink window from the left if the time difference exceeds the window
            while timestamps[end_idx] - timestamps[start_idx] > timedelta(hours=window_hours):
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
