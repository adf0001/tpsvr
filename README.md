# tpsvr
test page server

# Install
install globally for CLI
```
npm install tpsvr -g
```

# CLI Usage
```shell
D:\tmp>tpsvr -h
test-page-server cli, v1.0.0

Usgae: tpsvr [options]

The default behaviour is trying
        to start test-page-server,
        or to add current directory to project list,
        or to process work according options.

options:
        -h, --help              show help

        -a, --add [<dir>]       add directory
        -r, --remove [<dir>]    detach directory
        -o, --open              open default browser
		-o chrome|c|firefox|f|edge|e|none|n
		                        try to open with special browser

```

* default server is opened at http://127.0.0.1:8060
