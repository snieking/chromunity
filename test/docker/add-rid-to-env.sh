#!/usr/bin/env bash

RID=$(docker exec -it chromunity cat rell/target/blockchains/1/brid.txt)

echo "Adding RID ${RID} to project .env"
echo "REACT_APP_BRID=${RID}" > ../../.env