#!/bin/sh

. ./vars.sh
./postchain.sh add-blockchain -bc config/$APPNAME.configuration.xml -brid $BRID  -cid 0 -nc config/node-config.properties -f

