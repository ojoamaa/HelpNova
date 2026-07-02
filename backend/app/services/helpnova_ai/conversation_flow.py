from app.services.helpnova_ai.conversation_state import ConversationStateManager


class ConversationFlow:

    @classmethod
    def next_question(cls, user_id):

        state = ConversationStateManager.get(user_id)

        if not state:
            return None

        draft = state["job_draft"]

        required = draft["required_details"]

        for field in required:

            if field not in draft:

                if field == "customer location":
                    return "Where should the professional come to?"

                if field == "preferred time":
                    return "When would you like the service?"

                if field == "phone number":
                    return "Please confirm your phone number."

                if field == "photo if available":
                    return "Please upload a photo if possible."

        return None
