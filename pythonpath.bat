@ECHO OFF
setlocal
set PYTHONPATH=%1
set CURDIR=%cd%
%cd%\venv\Scripts\python.exe %2 %3
endlocal