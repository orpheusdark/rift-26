# scoring.py

# Risk score constants for fraud rings
_BASE_CYCLE_RISK = 50.0    # baseline risk for any detected cycle
_RISK_PER_MEMBER = 5.0     # additional risk per cycle member
_VOLUME_SCALE = 10000.0    # normalise transaction volume contribution
_MAX_VOLUME_RISK = 45.0    # cap on volume-based risk contribution

# Suspicion score boosts per detected pattern (each capped at 100 total)
_BOOST_CYCLE = 30.0
_BOOST_SMURFING = 20.0
_BOOST_SHELL = 15.0
_BOOST_VELOCITY = 25.0
_BOOST_ANOMALY = 10.0

def generate_scores(
    cycles,
    smurfing,
    shells,
    velocity,
    anomalies,
    pagerank,
    flow_metrics
):
    suspicious_map = {}
    fraud_rings = []
    account_to_ring = {}

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

    # Accounts in cycles
    for ring in fraud_rings:
        pattern = f"cycle_length_{len(ring['member_accounts'])}"
        for acc in ring["member_accounts"]:
            entry = get_or_create(acc)
            if pattern not in entry["detected_patterns"]:
                entry["detected_patterns"].append(pattern)
            entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_CYCLE)

    # Smurfing / fan-out signal
    for acc in smurfing:
        if acc not in flow_metrics:
            continue
        entry = get_or_create(acc)
        if "smurfing" not in entry["detected_patterns"]:
            entry["detected_patterns"].append("smurfing")
        entry["suspicion_score"] = min(100.0, entry["suspicion_score"] + _BOOST_SMURFING)

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

    suspicious_accounts = list(suspicious_map.values())
    # Round suspicion_score and sort descending
    for acc in suspicious_accounts:
        acc["suspicion_score"] = round(acc["suspicion_score"], 1)
    suspicious_accounts.sort(key=lambda x: x["suspicion_score"], reverse=True)

    return suspicious_accounts, fraud_rings
