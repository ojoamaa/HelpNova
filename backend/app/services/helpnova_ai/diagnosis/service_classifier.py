class ServiceClassifier:

    SERVICES = {

        "Plumbing": [
            "pipe", "water", "tap", "sink", "toilet",
            "drain", "bathroom", "leak", "plumber"
        ],

        "Electrical": [
            "light", "socket", "switch", "breaker",
            "wire", "electric", "power", "electrician"
        ],

        "Cleaning": [
            "clean", "washing", "laundry",
            "office cleaning", "house cleaning"
        ],

        "Air Conditioning": [
            "ac", "air conditioner", "cooling",
            "compressor", "gas refill"
        ],

        "Generator": [
            "generator", "gen", "diesel",
            "petrol", "starting"
        ],

        "Painting": [
            "paint", "wall", "ceiling"
        ],

        "Carpentry": [
            "door", "window", "wood",
            "chair", "table"
        ]
    }

    @classmethod
    def classify(cls, text: str):

        message = text.lower()

        for service, keywords in cls.SERVICES.items():
            for keyword in keywords:
                if keyword in message:
                    return service

        return "General Services"
