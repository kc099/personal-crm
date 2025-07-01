@echo off
echo Starting Django backend...
start cmd /k "cd andon_project && ..\andon-env\Scripts\activate && python manage.py runserver"

echo Starting Express server...
start cmd /k "cd express-server && node server.js"

echo Starting React frontend...
start cmd /k "cd frontend\andon-dashboard && npm start"

pause
