@echo off
setlocal
set PYTHONPATH=%cd%\packages;%PYTHONPATH%
pytest tests/backend/test_auth.py --cov=packages/backend --cov=packages/frontend --maxfail=1 --disable-warnings -q
endlocal