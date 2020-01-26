#!/usr/bin/env bash

cd rell

sed -i "s/localhost/${POSTGRES_HOST}/g" config/node-config.properties
sed -i "s/blockchain/${POSTGRES_SCHEMA}/g" config/node-config.properties
sed -i "s/database.username=postchain/database.username=${POSTGRES_USER}/g" config/node-config.properties
sed -i "s/database.password=postchain/database.password=${POSTGRES_PASS}/g" config/node-config.properties

sed -i "s/0350fe40766bc0ce8d08b3f5b810e49a8352fdd458606bd5fafe5acdcdc8ff3f57/${MESSAGING_PUBKEY}/g" config/node-config.properties
sed -i "s/3132333435363738393031323334353637383930313233343536373839303131/${MESSAGING_PRIVKEY}/g" config/private.properties

echo "Compiling Chromunity..."
./build.sh
echo "Chromunity compiled successfully!"

echo "Starting Chromunity..."
./run-dev-node.sh