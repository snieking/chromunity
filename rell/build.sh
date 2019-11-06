#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf blockchain
mkdir blockchain

echo "Compiling Chromunity blockchain"
postchain-node/rellcfg.sh --template config/config.template.xml -d src/ "" blockchain/blockchain.xml
cp config/brid.txt blockchain/brid.txt
echo "Successfully compiled Chromunity blockchain"