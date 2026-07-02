class PermissionEngine:

    permissions = {

        "customer": [
            "create_job",
            "job_status",
            "jobs",
            "payment",
            "receipt",
            "dispute",
            "confirm"
        ],

        "worker": [
            "wallet",
            "job_status",
            "jobs",
            "payment",
            "receipt",
            "confirm"
        ],

        "admin": [
            "dashboard",
            "payment",
            "worker",
            "dispute",
            "receipt",
            "jobs",
            "confirm"
        ]
    }

    @classmethod
    def allowed(cls, role, intent):
        allowed = cls.permissions.get(role, [])
        return intent in allowed or intent == "general"