from datetime import datetime


def dispatch_to_top_workers(job, matching_result):
    top_matches = matching_result.get("top_matches", [])

    dispatches = []

    for worker in top_matches:
        dispatches.append({
            "job_id": job.id,
            "worker_id": worker["worker_id"],
            "worker_name": worker["full_name"],
            "profession": worker["profession"],
            "match_score": worker["match_score"],
            "dispatch_status": "notified",
            "sent_at": datetime.utcnow().isoformat()
        })

    return {
        "total_notified": len(dispatches),
        "dispatches": dispatches
    }