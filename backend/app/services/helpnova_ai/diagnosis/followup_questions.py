class FollowupQuestions:

    QUESTIONS = {

        "Plumbing": [
            "Where is the leak located?",
            "Is water still flowing?",
            "Can you upload a photo?"
        ],

        "Electrical": [
            "Is the power completely off?",
            "Is there a burning smell?",
            "Can you upload a photo?"
        ],

        "Cleaning": [
            "Residential or commercial?",
            "How many rooms require cleaning?"
        ],

        "Air Conditioning": [
            "Is the AC turning on?",
            "Is it cooling at all?"
        ],

        "Generator": [
            "Does it crank?",
            "Does it produce smoke?"
        ]
    }

    @classmethod
    def get_questions(cls, service):

        return cls.QUESTIONS.get(service, [])
