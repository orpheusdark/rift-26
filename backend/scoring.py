# scoring.py

def generate_scores(
    cycles,
    smurfing,
    shells,
    velocity,
    anomalies,
    pagerank,
    flow_metrics
):
    suspicious_accounts = []
    fraud_rings = []
    suspicious_map = {}

    # Flag suspicious accounts
    for account, pr in pagerank.items():
        if account not in flow_metrics:
            continue
            
        net_flow = flow_metrics[account]["net_flow"]
        risk_score = pr * abs(net_flow)

        if risk_score > 50:  # adjustable threshold
            suspicious_map[account] = {
                "account_id": account,
                "reasons": ["high_risk_flow"],
                "risk_score": round(risk_score, 4),
                "pagerank": round(pr, 4),
                "metrics": flow_metrics[account]
            }

    # Helper to merge signals
    def merge_signal(account_list, reason, score_boost):
        for acc in account_list:
            if acc not in flow_metrics:
                continue
                
            if acc not in suspicious_map:
                suspicious_map[acc] = {
                    "account_id": acc,
                    "reasons": [],
                    "risk_score": 0.0,
                    "pagerank": round(pagerank.get(acc, 0), 4),
                    "metrics": flow_metrics.get(acc, {})
                }
            
            if reason not in suspicious_map[acc]["reasons"]:
                suspicious_map[acc]["reasons"].append(reason)
                suspicious_map[acc]["risk_score"] += score_boost

    merge_signal(smurfing, "smurfing", 20.0)
    merge_signal(shells, "shell_account", 15.0)
    merge_signal(velocity, "high_velocity", 25.0)
    merge_signal(anomalies, "amount_anomaly", 10.0)

    suspicious_accounts = list(suspicious_map.values())
    suspicious_accounts.sort(key=lambda x: x["risk_score"], reverse=True)

    # Build fraud rings
    ring_id = 0
    for cycle in cycles:
        # Ensure all members are in metrics
        if not all(n in flow_metrics for n in cycle):
            continue
            
        total_in = sum(flow_metrics[n]["incoming_total"] for n in cycle)
        total_out = sum(flow_metrics[n]["outgoing_total"] for n in cycle)

        fraud_rings.append({
            "ring_id": f"R{ring_id}",
            "member_accounts": cycle,
            "pattern_type": "cycle",
            "risk_score": {
                "incoming_total": total_in,
                "outgoing_total": total_out,
                "net_flow": total_in - total_out,
                "transaction_count": sum(
                    flow_metrics[n]["transaction_count"] for n in cycle
                )
            }
        })
        ring_id += 1

    return suspicious_accounts, fraud_rings
