@echo off
call "%USERPROFILE%\Miniconda3\Scripts\activate.bat" "%~dp0mint-venv"
pip install tensorflow==2.5.0 librosa absl-py einops scipy
