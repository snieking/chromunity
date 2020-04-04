#!/usr/bin/env bash

BRID=$(docker exec -it chromunity cat rell/target/blockchains/1/brid.txt)

echo "Adding BRID ${BRID} to project .env"
echo "REACT_APP_BRID=${BRID}" > ../../.env