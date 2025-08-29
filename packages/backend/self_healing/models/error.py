# backend/self_healing/models/error.py

class Error:
    def __init__(self, timestamp, message, file, line_number, raw_log):
        self.timestamp = timestamp
        self.message = message
        self.file = file
        self.line_number = line_number
        self.raw_log = raw_log

    def __repr__(self):
        return f"Error(file='{self.file}', line={self.line_number}, message='{self.message[:50]}...')"