#!/bin/bash

cp credentials.json $1/credentials.json

case "$2" in
    develop)
        docker build -f $1/Dockerfile -t function-develop-$1 $1
        docker run -v `pwd`/$1/src:/opt/function/src -p 8090:8090 function-develop-$1
        ;;
  *)
        echo "Usage: function.sh {develop}" >&2
        exit 1
        ;;
esac

exit 0