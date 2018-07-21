#!/bin/bash

if [ -d 'env' ]; then
    rm -rf 'env'
fi

virtualenv --python=python3 env
. env/bin/activate
pip install -r requirements.txt
