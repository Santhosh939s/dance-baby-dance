@echo off
call "%USERPROFILE%\Miniconda3\Scripts\activate.bat" "%~dp0mint-venv"
python test_inference.py --audio "..\test_song.wav"
