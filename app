#!/bin/sh

trap ctrl_c INT

# also kill backend so doesnt hog port
ctrl_c () {
    kill "$bpid"
    exit
}

# start server one in background
python3.10 ./backend/server.py &
bpid=$!

# start frontend process
cd frontend
npm start
 
wait

