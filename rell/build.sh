#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

rm -rf config/blockchains
mkdir config/blockchains
mkdir config/blockchains/1

echo "Compiling Chromunity blockchain"
postchain-node/rellcfg.sh --template config/config.template.xml -d src/ "" config/blockchains/1/0.xml
cp config/brid.txt config/blockchains/1/brid.txt
echo "Successfully compiled Chromunity blockchain"