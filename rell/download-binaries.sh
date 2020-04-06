#!/usr/bin/env bash

set -ex

PACKAGE=rellr-0.10.2-3.1.3-dist.tar.gz

echo "Downloading ${PACKAGE}"
curl -o ${PACKAGE} -L http://www.chromia.dev/rellr/${PACKAGE}
tar -zxvf ${PACKAGE}
rm ${PACKAGE}