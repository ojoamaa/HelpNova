class PricingEstimator:

    PRICE = {

        "Plumbing": "₦8,000 - ₦15,000",
        "Electrical": "₦10,000 - ₦20,000",
        "Cleaning": "₦5,000 - ₦12,000",
        "Generator": "₦15,000 - ₦40,000",
        "Air Conditioning": "₦12,000 - ₦25,000",

    }

    @classmethod
    def estimate(cls, service):

        return cls.PRICE.get(
            service,
            "To be determined"
        )
