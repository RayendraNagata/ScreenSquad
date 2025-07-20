@echo off
echo Setting up ScreenSquad Development Environment...
echo.
echo Installing all dependencies...
npm run install:all
echo.
echo Setup complete! You can now run:
echo   npm run dev      - Start both frontend and backend
echo   start-dev.bat    - Alternative way to start development servers
echo.
pause
