class AgentRouter:

    @staticmethod
    def route(intent: str):
        routes = {
            "create_job": "booking_agent",
            "job_status": "booking_agent",
            "payment": "payment_agent",
            "receipt": "receipt_agent",
            "wallet": "wallet_agent",
            "worker": "worker_agent",
            "dashboard": "admin_agent",
            "dispute": "complaint_agent",
            "general": "general_agent",
        }

        return routes.get(intent, "general_agent")
