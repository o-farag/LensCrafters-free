# LensCrafters-free

#### Note on cloning
Since this repo using submodules, there are a few extra steps to clone it properly
```
git clone --recurse-submodules git@github.com:Lenscrafters-Capstone/LensCrafters-free.git
```
If that doesn't work, try the following steps instead

```
$ git clone git@github.com:Lenscrafters-Capstone/LensCrafters-free.git
$ git submodule init
$ git submodule update
```


Steps to test: 
- Start the server by running `python server.py` in the backend directory
- View the frontend in browser by running `npm start` in the frontend directory, need to run `npm install` first to install required packages
