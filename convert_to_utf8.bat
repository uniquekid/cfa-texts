@echo off
setlocal enabledelayedexpansion

set "DIR=.\Text"

for %%f in ("%DIR%\*.txt") do (
    echo Converting "%%f"...
    powershell -NoProfile -Command "$bytes = [System.IO.File]::ReadAllBytes('%%f'); $text = [System.Text.Encoding]::GetEncoding(1251).GetString($bytes); $text = $text.Replace(\"`r`n\", \"`n\"); $utf8 = [System.Text.UTF8Encoding]::new($false).GetBytes($text); [System.IO.File]::WriteAllBytes('%%f', $utf8)"
)

echo Done.
