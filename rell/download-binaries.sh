#!/usr/bin/env bash

set -ex

PACKAGE=rellr-0.10.3-ver-3.3.0-dist.tar.gz

echo "Downloading ${PACKAGE}"
curl -o ${PACKAGE} -L http://www.chromia.dev/rellr/${PACKAGE}
tar -zxvf ${PACKAGE}
rm ${PACKAGE}
