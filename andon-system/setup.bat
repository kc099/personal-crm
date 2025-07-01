@echo off
echo Activating virtual environment...
call andon-env\Scripts\activate

echo Installing Python requirements...
pip install -r requirements.txt

echo Installing frontend dependencies...
cd frontend\andon-dashboard
call npm install
cd ../..

echo Installing Express dependencies...
cd express-server
call npm install
cd ..

echo Setup complete!
pause
