 from sqlalchemy.orm import Session

from app.services.executive_dashboard_service import executive_dashboard


def generate_ai_insights(db: Session):
    dashboard = executive_dashboard(db)

    insights = []

    jobs = dashboard["jobs"]
    finance = dashboard["finance"]
    live = dashboard["live_operations"]

    # Pending jobs
    if jobs.get("pending", 0) > 0:
        insights.append({
            "type": "operations",
            "priority": "medium",
            "message": f"{jobs.get('pending')} jobs are pending. Review worker availability and dispatch quickly."
        })

    # Low worker supply
    if live["workers"].get("online", 0) < 3:
        insights.append({
            "type": "worker_supply",
            "priority": "high",
            "message": "Online worker supply is low. Encourage more verified workers to come online."
        })

    # Escrow analysis
    if finance["escrow"].get("holding", 0) > finance["escrow"].get("released", 0):
        insights.append({
            "type": "cashflow",
            "priority": "medium",
            "message": "Escrow holding is higher than released payouts. Review pending jobs and release completed payments faster."
        })

    # Revenue analysis
    if finance["platform"].get("total_revenue", 0) < 50000:
        insights.append({
            "type": "revenue",
            "priority": "medium",
            "message": "Platform revenue is still low. Increase customer acquisition and complete more paid jobs."
        })

    # Wallet liquidity
    if finance["wallets"].get("pending_balance", 0) > finance["wallets"].get("available_balance", 0):
        insights.append({
            "type": "wallet",
            "priority": "medium",
            "message": "Pending wallet balances exceed available balances. Process escrow releases promptly."
        })

    # Business health
    if dashboard["business_health_score"] < 80:
        insights.append({
            "type": "business_health",
            "priority": "high",
            "message": "Business health score is below target. Focus on improving revenue, job completion, and worker activity."
        })

    # Excellent platform
    if dashboard["business_health_score"] >= 90:
        insights.append({
            "type": "achievement",
            "priority": "low",
            "message": "Excellent platform health. Maintain operational efficiency while scaling users and transactions."
        })

    # Default insight
    if len(insights) == 0:
        insights.append({
            "type": "general",
            "priority": "low",
            "message": "Platform operations are healthy. Continue monitoring key performance indicators."
        })

    return {
        "generated_at": str(dashboard.get("generated_at", "")),
        "business_health_score": dashboard["business_health_score"],
        "total_insights": len(insights),
        "insights": insights
    }
