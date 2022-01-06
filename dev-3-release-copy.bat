
set destDir=release\tpsvr

xcopy server\tpsvr-main.bundle.minimized.js %destDir%\server\ /d
xcopy server\tpsvr-cli.js %destDir%\server\ /d
xcopy server\tpsvr-config.js %destDir%\server\ /d
xcopy server\res\*.* %destDir%\server\res\ /d

xcopy bin\*.* %destDir%\bin\ /d

xcopy client\root\bundle-client.minimized.js %destDir%\client\root\ /d
xcopy client\root\favicon.ico %destDir%\client\root\ /d
xcopy client\root\index.html %destDir%\client\root\ /d
xcopy client\root\res\*.* %destDir%\client\root\res\ /d

xcopy package.json %destDir%\ /d
xcopy README.md %destDir%\ /d
xcopy dev-2-server-run.bat %destDir%\ /d

if exist %destDir%\output rmdir /s %destDir%\output

pause
