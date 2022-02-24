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

Usage: tpsvr [options]

The default behaviour is trying
        to start test-page-server in foreground,
        or to add current directory to project list,
        or to process work according options.

options:
        -h, --help              show help.

        --start                 start server in background.
        --start foreground|f    start server in foreground.
        --stop                  stop server.
        -c, --check             only check the server, don't start and don't add project.
        --bundle                use bundle version.

        -a, --add [<dir>]       add directory.
        -r, --remove [<dir>]    detach directory/project.

        -o, --open              open default browser.
        -o chrome|c|firefox|f|edge|e|none|n
                                try to open with special browser.

```

* default server is opened at http://127.0.0.1:8060
