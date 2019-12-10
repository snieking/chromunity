#!/usr/bin/env bash

set -ex

PACKAGE=rellr-0.10.1-dev-3.0.1-dist.tar.gz

echo "Downloading ${PACKAGE}"
curl -o ${PACKAGE} -L http://dist.chromia.dev/rellr/${PACKAGE}
tar -zxvf ${PACKAGE}
rm ${PACKAGE}