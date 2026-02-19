# scoring.py

# Risk score constants for fraud rings
_BASE_CYCLE_RISK = 50.0    # baseline risk for any detected cycle
_RISK_PER_MEMBER = 5.0     # additional risk per cycle member
_VOLUME_SCALE = 10000.0    # normalise transaction volume contribution
_MAX_VOLUME_RISK = 45.0    # cap on volume-based risk contribution

# Suspicion score boosts per detected pattern (each capped at 100 total)
# Cycle boost varies by cycle length: longer cycles are harder to trace and more suspicious.
_BOOST_CYCLE_BASE = 20.0       # base boost for any cycle membership
_BOOST_CYCLE_PER_HOP = 4.0     # additional boost per hop in the cycle
_MAX_CYCLE_BOOST = 50.0        # cap on cycle boost (hit at length 8+)

_BOOST_FAN_IN = 25.0           # aggregator account (many senders → one)
_BOOST_FAN_OUT = 20.0          # disperser account (one → many receivers)
_BOOST_SHELL = 15.0
_BOOST_VELOCITY = 25.0
_BOOST_ANOMALY = 10.0

# PageRank contribution: scale raw PageRank value to a 0–20 point boost.
# Accounts with higher network centrality are more suspicious.
_PAGERANK_SCALE = 500.0
_MAX_PAGERANK_BOOST = 20.0


def generate_scores(
    cycles,
    smurfing,
    shells,
    velocity,
    anomalies,
    pagerank,
    flow_metrics
):
    """Generate suspicion scores and fraud ring summaries.

    Args:
        smurfing: dict with keys 'fan_in' (list of aggregator accounts) and
                  'fan_out' (list of disperser accounts).
    """
    suspicious_map = {}
    fraud_rings = []
    account_to_ring = {}

    fan_in_accounts = set(smurfing.get("fan_in", []))
    fan_out_accounts = set(smurfing.get("fan_out", []))

    # Build fraud rings from cycles and track ring membership
    ring_counter = 1
    for cycle in cycles:
        if not all(n in flow_metrics for n in cycle):
            continue

        ring_id = f"RING_{ring_counter:03d}"
        ring_counter += 1

        total_in = sum(flow_metrics[n]["incoming_total"] for n in cycle)
        total_out = sum(flow_metrics[n]["outgoing_total"] for n in cycle)
        volume = total_in + total_out
        risk = round(min(100.0, _BASE_CYCLE_RISK + len(cycle) * _RISK_PER_MEMBER + min(volume / _VOLUME_SCALE, _MAX_VOLUME_RISK)), 1)

        fraud_rings.append({
            "ring_id": ring_id,
            "member_accounts": cycle,
            "pattern_type": "cycle",
            "risk_score": risk
        })

        for acc in cycle:
            if acc not in account_to_ring:
                account_to_ring[acc] = ring_id

    def get_or_create(acc):
        if acc not in suspicious_map:
            suspicious_map[acc] = {
                "account_id": acc,
                "suspicion_score": 0.0,
                "detected_patterns": [],
                "ring_id": account_to_ring.get(acc, "")
            }
        return suspicious_map[acc]

    # Accounts in cycles — boost varies by cycle length
    for ring in fraud_rings:
        length = len(ring["member_accounts"])
        pattern = f"cycle_length_{length}"
        cycle_boost = min(_MAX_CYCLE_BOOST, _BOOST_CYCLE_BASE + length * _BOOST_CYCLE_PER_HOP)
        for acc in ring["member_accounts"]:
            entry = get_or_create(acc)
            if pattern not in entry["detected_patterns"]:
                entry["detected_patterns"].append(pattern)
            entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + cycle_boost)

    # Fan-in (aggregator) smurfing
    for acc in fan_in_accounts:
        if acc not in flow_metrics:
            continue
        entry = get_or_create(acc)
        if "fan_in" not in entry["detected_patterns"]:
            entry["detected_patterns"].append("fan_in")
        entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_FAN_IN)

    # Fan-out (disperser) smurfing
    for acc in fan_out_accounts:
        if acc not in flow_metrics:
            continue
        entry = get_or_create(acc)
        if "fan_out" not in entry["detected_patterns"]:
            entry["detected_patterns"].append("fan_out")
        entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_FAN_OUT)

    # Shell accounts
    for acc in shells:
        if acc not in flow_metrics:
            continue
        entry = get_or_create(acc)
        if "shell_account" not in entry["detected_patterns"]:
            entry["detected_patterns"].append("shell_account")
        entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_SHELL)

    # High-velocity transactions
    for acc in velocity:
        if acc not in flow_metrics:
            continue
        entry = get_or_create(acc)
        if "high_velocity" not in entry["detected_patterns"]:
            entry["detected_patterns"].append("high_velocity")
        entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_VELOCITY)

    # Amount anomalies
    for acc in anomalies:
        if acc not in flow_metrics:
            continue
        entry = get_or_create(acc)
        if "amount_anomaly" not in entry["detected_patterns"]:
            entry["detected_patterns"].append("amount_anomaly")
        entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_ANOMALY)

    # PageRank-based boost: accounts more central in the transaction network
    # have higher influence and are more suspicious. This differentiates scores
    # among accounts with the same raw pattern boosts.
    if pagerank:
        for acc, entry in suspicious_map.items():
            pr = pagerank.get(acc, 0.0)
            pr_boost = min(_MAX_PAGERANK_BOOST, pr * _PAGERANK_SCALE)
            entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + pr_boost)

    suspicious_accounts = list(suspicious_map.values())
    # Round suspicion_score and sort descending
    for acc in suspicious_accounts:
        acc["suspicion_score"] = round(acc["suspicion_score"], 1)
    suspicious_accounts.sort(key=lambda x: x["suspicion_score"], reverse=True)

    return suspicious_accounts, fraud_rings
