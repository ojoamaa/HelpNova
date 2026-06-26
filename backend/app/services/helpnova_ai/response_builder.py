class ResponseBuilder:

    @staticmethod
    def success(intent, message, data=None):
        return {
            "success": True,
            "intent": intent,
            "message": message,
            "data": data
        }

    @staticmethod
    def error(message):
        return {
            "success": False,
            "message": message
        }
