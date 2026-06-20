#!/bin/bash
echo "Starting server..."
set -a
source config.env
set +a
python3 server.py