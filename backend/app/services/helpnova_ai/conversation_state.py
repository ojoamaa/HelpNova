class ConversationStateManager:

    sessions = {}

    @classmethod
    def get(cls, user_id):
        return cls.sessions.get(user_id)

    @classmethod
    def save(cls, user_id, state):
        cls.sessions[user_id] = state
        return state

    @classmethod
    def update(cls, user_id, key, value):
        if user_id not in cls.sessions:
            cls.sessions[user_id] = {}

        cls.sessions[user_id][key] = value
        return cls.sessions[user_id]

    @classmethod
    def clear(cls, user_id):
        cls.sessions.pop(user_id, None)