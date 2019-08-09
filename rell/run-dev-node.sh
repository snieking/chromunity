#!/bin/bash

set -e

./build.sh

if [[ $1 == "WIPE_DB" ]]; then 
	echo "Deleting the database..."
	postchain-node/postchain.sh wipe-db -nc config/node-config.properties
fi


exec postchain-node/postchain.sh run-node-auto -d config
