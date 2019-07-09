#!/bin/bash

scriptdir=`dirname $0`


java -cp $scriptdir/postchain-node/lib/postchain-base-2.5-jar-with-dependencies.jar:$APPCP net.postchain.AppKt $@

