class IntentDetector:

    def detect(self, message: str):
        text = message.lower().strip()

        intents = {
            "create_job": [
                "book",
                "need",
                "find",
                "service",
                "plumber",
                "electrician",
                "cleaner",
                "mechanic"
            ],

            "job_status": [
                "job status",
                "track",
                "where is my worker",
                "progress"
            ],

            "payment": [
                "payment",
                "paid",
                "escrow",
                "invoice"
            ],

            "receipt": [
                "receipt",
                "download receipt",
                "verify receipt",
                "qr"
            ],

            "wallet": [
                "wallet",
                "earnings",
                "balance",
                "withdraw"
            ],

            "worker": [
                "worker",
                "artisan",
                "provider"
            ],

            "dashboard": [
                "dashboard",
                "revenue",
                "analytics",
                "report"
            ],

            "dispute": [
                "complaint",
                "dispute",
                "problem",
                "refund"
            ]
        }

        for intent, keywords in intents.items():
            for keyword in keywords:
                if keyword in text:
                    return intent

        return "general"
