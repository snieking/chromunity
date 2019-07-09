#!/bin/bash

set -eu

scriptdir=`dirname ${BASH_SOURCE[0]}`

${RELL_JAVA:-java} -cp "$scriptdir/lib/*" net.postchain.AppKt $@

