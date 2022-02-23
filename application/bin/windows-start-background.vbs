
Set args = WScript.Arguments

Set ws = CreateObject("Wscript.Shell")

If args.Count>0 Then
	ws.run "cmd /c windows-start.bat " & WScript.Arguments(0) ', vbhide
else
	ws.run "cmd /c windows-start.bat" ', vbhide
end if
