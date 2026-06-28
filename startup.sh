#!/bin/bash

echo "Building Frontend client..."
## move to client app folder
cd ./app

for arg in "$@"; do
    if [ "$arg" = "--force" ]; then
        echo "Clean node_modules/ and dist/."
        rm -rf ./node_modules
        rm -rf ./dist
        break
    fi
done

node_modules_folder="./node_modules"
dist_folder="./dist"

if [ -d "$node_modules_folder" ]; then
    echo "Skip dependencies download."
else
    echo "Download dependencies."
    npm install
fi

# building app

if [ -d "$dist_folder" ]; then
    echo "Skip build."
else
    echo "Building app."
    npm run build
fi

# back to serve folder
cd ..
## start BE server
echo "Starting Backend server..."
set -a
source config.env
set +a
python3 server.py