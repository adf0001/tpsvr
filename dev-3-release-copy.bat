
set dest=release\tpsvr

xcopy server\tpsvr-main.bundle.minimized.js %dest%\server\ /d
xcopy server\tpsvr-cli.js %dest%\server\ /d
xcopy server\tpsvr-config.js %dest%\server\ /d
xcopy server\res\*.* %dest%\server\res\ /d

xcopy bin\*.* %dest%\bin\ /d

xcopy client\root\bundle-client.minimized.js %dest%\client\root\ /d
xcopy client\root\favicon.ico %dest%\client\root\ /d
xcopy client\root\index.html %dest%\client\root\ /d
xcopy client\root\res\*.* %dest%\client\root\res\ /d

xcopy package.json %dest%\ /d
xcopy README.md %dest%\ /d
xcopy dev-2-server-run.bat %dest%\ /d

if exist %dest%\output rmdir /s %dest%\output

pause
