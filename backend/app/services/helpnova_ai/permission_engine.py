class PermissionEngine:

    permissions = {

        "customer": [
            "create_job",
            "job_status",
            "payment",
            "receipt",
            "dispute"
        ],

        "worker": [
            "wallet",
            "job_status",
            "payment",
            "receipt"
        ],

        "admin": [
            "dashboard",
            "payment",
            "worker",
            "dispute",
            "receipt"
        ]
    }

    @classmethod
    def allowed(cls, role, intent):

        allowed = cls.permissions.get(role, [])

        return intent in allowed or intent == "general"
