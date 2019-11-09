#!/bin/bash
  
set -e

BLOCK_HEIGHT=$(sudo -u postgres psql -qtAX -c 'SET search_path to blockchain; SELECT block_height FROM blocks ORDER BY block_height DESC LIMIT 1;' chromunity)
DEPLOY_HEIGHT=$((BLOCK_HEIGHT + 10))

echo "Current block height is $BLOCK_HEIGHT, new config will be deployed at block height $DEPLOY_HEIGHT"
postchain-node/postchain.sh add-configuration -bc config/blockchains/0/0.xml -h $DEPLOY_HEIGHT -cid 0 -nc config/node-config.properties
