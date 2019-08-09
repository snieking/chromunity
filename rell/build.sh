#!/bin/bash

# This script produces blockchain configurations which
# include Rell source code

set -eu

CHAIN_DIRS=()
CHAIN_DIRS[1]=src/chain1

CONF=dev

rm -rf config/blockchains
mkdir config/blockchains

for i in "${!CHAIN_DIRS[@]}"; do
   CHAIN_ID=$i
   CHAIN_DIR=${CHAIN_DIRS[$i]}
   echo "Compiling $CHAIN_DIR as chain $CHAIN_ID"
   mkdir config/blockchains/$CHAIN_ID
   postchain-node/rellcfg.sh --template $CHAIN_DIR/config/$CONF/config.template.xml $CHAIN_DIR/rell/main.rell config/blockchains/$CHAIN_ID/0.xml
   cp $CHAIN_DIR/config/$CONF/brid.txt config/blockchains/$CHAIN_ID/brid.txt
done

