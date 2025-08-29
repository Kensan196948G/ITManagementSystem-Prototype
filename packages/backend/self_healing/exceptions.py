# backend/self_healing/exceptions.py

class AutoRepairFailedError(Exception):
    """
    自動修復処理が失敗した場合に発生する例外。
    """
    pass
