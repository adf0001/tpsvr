
set destDir=release\tpsvr

xcopy application\server\tpsvr-main.bundle.minimized.js %destDir%\application\server\ /d
xcopy application\server\tpsvr-cli.js %destDir%\application\server\ /d
xcopy application\server\tpsvr-config.js %destDir%\application\server\ /d
xcopy application\server\res\*.* %destDir%\application\server\res\ /d

xcopy application\bin\*.* %destDir%\application\bin\ /d

xcopy application\client\root\bundle-client.minimized.js %destDir%\application\client\root\ /d
xcopy application\client\root\bundle-client.minimized.latest-compatible.js %destDir%\application\client\root\ /d
xcopy application\client\root\favicon.ico %destDir%\application\client\root\ /d
xcopy application\client\root\index.html %destDir%\application\client\root\ /d
xcopy application\client\root\res\*.* %destDir%\application\client\root\res\ /d

xcopy package.json %destDir%\ /d
xcopy README.md %destDir%\ /d
xcopy dev-2-server-run.bat %destDir%\ /d
xcopy dev-2-server-run.sh %destDir%\ /d
xcopy dev-2-server-run-bundle-minimized.bat %destDir%\ /d
xcopy dev-2-server-run-bundle-minimized.sh %destDir%\ /d

if exist %destDir%\output rmdir /s %destDir%\output

pause
