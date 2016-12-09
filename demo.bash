#!/bin/bash

if [ -n "$1" ] ; then
    cat << EOF

    Connection

  Usage: $0

    This script programs makes an effert to demonstrate this
  software package in a simple "Hello World" like way.

  It tries to run the server and launch a browser that connects
  to the server.

EOF
fi

# exit on failure
set -e
cd "$(dirname $0)"

# The software will not run if the node dependencies
# are not gotten.
if [ ! -d node_modules ] ; then
    make
    make install
fi


./mw_server &

if [ "$?" != 0 ] ; then
    echo "failed to start server"
fi

PID=$!

count=0
# Try to connect to the server
while ! nc -z -v -w 4 localhost 9999 ; do
    echo "($count) Server is not listening on port 9999 yet"
    let count=$count+1
    if [ $count = 4 ] ; then
        exit 1
    fi
    sleep 0.5
done

# run some browser clients
xdg-open http://localhost:9999/example.html &
xdg-open http://localhost:9999/example.html &


while wait $PID ; do
    echo "waiting for server"
done

