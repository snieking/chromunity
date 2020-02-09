#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf target

echo "Compiling Chromunity blockchain"
postchain-node/multigen.sh run.xml --source-dir=src --output-dir=target
echo "Successfully compiled Chromunity blockchain"

BRID=$(cat target/blockchains/1/brid.txt)
echo "Creating .env file with brid: ${BRID}"
echo "REACT_APP_BRID=${BRID}" > ../.env
