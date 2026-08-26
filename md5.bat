@echo off
rem  Background hashing job, re-entered via "start /b" from :hash below.
rem  Its parameters arrive through the environment, not the command line:
rem  "start" mis-parses a command line carrying several quoted arguments.
if /i "%~1"=="--hashworker" (
  pushd "%~dp0"
  .\md5deep64.exe -l ".\%HW_SRC%\*" > "%HW_TMP%"
  popd
  > "%HW_FLAG%" echo done
  exit /b 0
)
rem ---------------------------------------------------------------------------
rem  Rebuilds the .md5sums manifests for the card sprite folders.
rem  Output format is unchanged: "<md5>  .\<Folder>\<file>", sorted on column 36.
rem ---------------------------------------------------------------------------
setlocal
set "SELF=%~f0"
pushd "%~dp0"

call :initbar

echo.
echo Hashing sprites...
call :hash CardSprite      CardSprite.md5sums
call :hash CardSpriteMini2 CardSpriteMini2.md5sums

popd
endlocal
exit /b 0


rem === hash <folder> <output file> ===========================================
:hash
setlocal EnableDelayedExpansion
set "SRC=%~1"
set "OUT=%~2"

if not exist ".\%SRC%\" (
  echo   %SRC%: folder is missing - skipped.
  endlocal & exit /b 1
)

set "TMPF=%TEMP%\md5sums.%RANDOM%%RANDOM%.tmp"
set "FLAG=%TMPF%.done"
del "%TMPF%" "%FLAG%" >nul 2>&1

rem  md5deep runs unthrottled in the background, writing straight to %TMPF%.
rem  The loop below only samples how many lines have landed so far.  Piping
rem  md5deep through a "for /f" to count lines instead would roughly triple
rem  the runtime - the batch loop costs more than the hashing does.
set "HW_SRC=%SRC%"
set "HW_TMP=%TMPF%"
set "HW_FLAG=%FLAG%"
rem  "< nul" matters: without it the background cmd inherits the console and
rem  swallows keystrokes meant for the caller's prompts (deploy.bat hung there).
start "" /b "%SELF%" --hashworker < nul > nul 2>&1

rem  Counted after the worker is away, so the scan overlaps with the hashing.
set "total=0"
for /f %%N in ('dir /b /a-d ".\%SRC%\*" 2^>nul ^| %SystemRoot%\System32\find.exe /c /v ""') do set "total=%%N"

call :bar "%SRC%" 0 %total%
set "guard=20000"
:hashpoll
if exist "%FLAG%" goto :hashdone
set /a "guard-=1"
if !guard! leq 0 (
  echo.
  echo   %SRC%: hashing did not finish - aborted.
  del "%TMPF%" "%FLAG%" >nul 2>&1
  endlocal & exit /b 1
)
rem  "ping -n 1" is just a ~0.4s breather; a real sleep would cost a whole
rem  second, and that second is paid again after md5deep has already finished.
%SystemRoot%\System32\ping.exe -n 1 -4 127.0.0.1 > nul
call :sample
call :bar "%SRC%" !n! %total%
goto :hashpoll
:hashdone
call :sample
call :bar "%SRC%" !n! %total%
echo.

"%SystemRoot%\System32\sort.exe" /+36 "%TMPF%" > "%OUT%"
del "%TMPF%" "%FLAG%" >nul 2>&1
endlocal & exit /b 0


rem === sample ================================================================
rem  Counts the lines md5deep has written so far.  The file is still open for
rem  writing by the worker; find.exe reads it happily anyway.  Note find.exe is
rem  NOT quoted here: a "for /f" command that both starts with a quote and uses
rem  "<" gets mis-parsed by cmd and silently yields nothing.
:sample
set "n=0"
for /f %%N in ('%SystemRoot%\System32\find.exe /c /v "" ^< "%TMPF%" 2^>nul') do set "n=%%N"
exit /b 0


rem === initbar ===============================================================
rem  Grabs a real backspace character (0x08) and pre-builds the strings the
rem  progress bar needs.  Backspaces are used instead of a carriage return
rem  because "for /f" cannot capture a CR, and because "set /p" silently
rem  strips leading whitespace from its prompt.
:initbar
for /f %%A in ('"prompt $H & for %%B in (1) do rem"') do set "BS=%%A"
set "BARW=30"
set "BARFULL=##############################"
set "BAREMPTY=------------------------------"
set "b4=%BS%%BS%%BS%%BS%"
set "b16=%b4%%b4%%b4%%b4%"
set "b64=%b16%%b16%%b16%%b16%"
rem  BSPAD must be exactly as long as one rendered bar line (69 chars).
set "BSPAD=%b64%%b4%%BS%"
exit /b 0


rem === bar <label> <current> <total> =========================================
rem  Redraws a fixed-width 69-char status line in place, on stderr so it never
rem  lands in a redirected stdout.
:bar
setlocal EnableDelayedExpansion
set "cur=%~2"
set "tot=%~3"
if %tot% leq 0 set "tot=1"
set /a "pct=cur*100/tot"
if %pct% gtr 100 set "pct=100"
set /a "fill=pct*BARW/100"
set /a "rest=BARW-fill"
set "lbl=%~1                  "  & set "lbl=!lbl:~0,18!"
set "p=  %pct%"                  & set "pct=!p:~-3!"
set "p=      %cur%"              & set "cur=!p:~-6!"
set "p=      %tot%"              & set "tot=!p:~-6!"
set "gauge=!BARFULL:~0,%fill%!!BAREMPTY:~0,%rest%!"
<nul set /p "=%BSPAD%!lbl![!gauge!] !pct!%% !cur!/!tot!" 1>&2
endlocal & exit /b 0
