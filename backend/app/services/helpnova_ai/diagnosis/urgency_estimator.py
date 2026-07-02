class UrgencyEstimator:

    HIGH = [
        "fire",
        "gas",
        "burst",
        "flood",
        "smoke",
        "electrocution"
    ]

    MEDIUM = [
        "leak",
        "not working",
        "broken"
    ]

    @classmethod
    def estimate(cls, text):

        message = text.lower()

        for word in cls.HIGH:
            if word in message:
                return "High"

        for word in cls.MEDIUM:
            if word in message:
                return "Medium"

        return "Low"
