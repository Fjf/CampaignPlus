#!/bin/bash

if [ -d 'env' ]; then
    rm -rf 'env'
fi

virtualenv --python=python env
. env/bin/activate
pip install -r requirements.txt
