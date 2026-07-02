class IntentDetector:

    def detect(self, message: str):
        text = message.lower().strip()

        intents = {
            "jobs": [
                "my jobs",
                "show my jobs",
                "completed jobs",
                "pending jobs",
                "assigned jobs",
                "active jobs",
                "job status",
                "track",
                "where is my worker",
                "progress",
                "jobs",
                "job",
            ],

            "create_job": [

    # booking
    "book",
    "need",
    "find",
    "hire",
    "repair",
    "fix",
    "install",
    "replace",

    # plumbing
    "plumber",
    "pipe",
    "leak",
    "leaking",
    "sink",
    "tap",
    "toilet",
    "water",
    "drain",
    "bathroom",

    # electrical
    "electrician",
    "socket",
    "switch",
    "wire",
    "light",
    "fan",
    "generator",

    # cleaning
    "cleaner",
    "cleaning",

    # mechanical
    "mechanic",
    "car",
    "engine",

    # appliance
    "ac",
    "air conditioner",
    "fridge",
    "washing machine",

    # painting
    "paint",
    "painting",

    # carpentry
    "door",
    "window",
    "wood",

    # roofing
    "roof",

    # generic
    "fault",
    "problem",
    "broken",
    "damage",
    "repair service"

],

            "payment": [
                "payment",
                "paid",
                "escrow",
                "invoice",
            ],

            "receipt": [
                "receipt",
                "download receipt",
                "verify receipt",
                "qr",
            ],

            "wallet": [
                "wallet",
                "earnings",
                "balance",
                "withdraw",
            ],

            "worker": [
                "worker",
                "artisan",
                "provider",
            ],

            "dashboard": [
                "dashboard",
                "revenue",
                "analytics",
                "report",
            ],

            "confirm": [
                 "yes",
                 "go ahead",
                 "create it",
                 "proceed",
                 "confirm",
                 "continue",
                 "submit",
                 "okay",
                 "ok"
            ],

            "dispute": [
                "complaint",
                "dispute",
                "problem",
                "refund",
            ],
        }


        for intent, keywords in intents.items():
            for keyword in keywords:
                if keyword in text:
                    return intent

        return "general"