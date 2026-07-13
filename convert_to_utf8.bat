@echo off
setlocal enabledelayedexpansion

set "DIR=.\Text"

for %%f in ("%DIR%\*.txt") do (
    echo Converting "%%f"...
    powershell -NoProfile -Command ^
        "$bytes = [System.IO.File]::ReadAllBytes('%%f');" ^
        "$enc1251 = [System.Text.Encoding]::GetEncoding(1251);" ^
        "$text = $enc1251.GetString($bytes);" ^
        "$utf8NoBOM = New-Object System.Text.UTF8Encoding($false);" ^
        "[System.IO.File]::WriteAllText('%%f', $text, $utf8NoBOM);"
)

echo Done.
