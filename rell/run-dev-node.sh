#!/bin/bash

set -e

if [[ $1 == "WIPE_DB" ]]; then 
	echo "Deleting the database..."
	postchain-node/postchain.sh wipe-db -nc target/node-config.properties
	./build.sh
fi

exec postchain-node/postchain.sh run-node-auto -d target
