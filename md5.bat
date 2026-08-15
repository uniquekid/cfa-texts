@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: Get Carriage Return (CR) character for single-line progress bar updates
for /f %%a in ('copy /Z "%~f0" nul') do set "CR=%%a"

echo ==========================================
echo       MD5 Generator with Progress Bar
echo ==========================================
echo.

:: Execute batch processing for each directory
call :ProcessFolder ".\CardSprite" "CardSprite.md5sums"
call :ProcessFolder ".\CardSpriteMini2" "CardSpriteMini2.md5sums"

echo ==========================================
echo  [Done] All tasks completed successfully!
echo ==========================================
echo.
pause
exit /b

:: ----------------------------------------------------
:: Subroutine: ProcessFolder
:: ----------------------------------------------------
:ProcessFolder
set "TARGET_DIR=%~1"
set "OUTPUT_FILE=%~2"
set "TEMP_FILE=%OUTPUT_FILE%.tmp"

if exist "%TEMP_FILE%" del "%TEMP_FILE%"

echo Processing directory: %TARGET_DIR%

:: 1. Count total files to calculate progress percentage
set /a TOTAL=0
for /f %%F in ('dir /b /s /a-d "%TARGET_DIR%\*" 2^>nul ^| find /c /v ""') do set TOTAL=%%F

if %TOTAL%==0 (
    echo [Warning] Folder "%TARGET_DIR%" is empty or does not exist.
    echo ------------------------------------------
    echo.
    exit /b
)

set /a CURRENT=0

:: 2. Loop through files, process MD5 hashes, and update progress bar
for /f "delims=" %%F in ('dir /b /s /a-d "%TARGET_DIR%\*"') do (
    set /a CURRENT+=1
    set /a PERCENT=CURRENT*100/TOTAL
    set /a FILLED=PERCENT/5
    set /a EMPTY=20-FILLED

    :: Construct progress bar string ([#####-----])
    set "BAR="
    if !FILLED! gtr 0 (
        for /l %%I in (1,1,!FILLED!) do set "BAR=!BAR!#"
    )
    set "SPACES="
    if !EMPTY! gtr 0 (
        for /l %%I in (1,1,!EMPTY!) do set "SPACES=!SPACES!-"
    )

    :: Overwrite current line using !CR!
    <nul set /p "=Progress: [!BAR!!SPACES!] !PERCENT!%% (!CURRENT!/%TOTAL%)!CR!"

    :: Execute md5deep64 for each file and append output to temp file
    .\md5deep64.exe -l "%%F" >> "%TEMP_FILE%" 2>nul
)

echo.
echo Sorting output to %OUTPUT_FILE%...

:: 3. Sort output starting from character position 36
type "%TEMP_FILE%" | sort /+36 > "%OUTPUT_FILE%"
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

echo [OK] Saved to %OUTPUT_FILE%
echo ------------------------------------------
echo.
exit /b