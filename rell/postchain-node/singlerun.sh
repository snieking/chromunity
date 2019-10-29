#!/bin/bash
set -eu

D=`dirname ${BASH_SOURCE[0]}`

${RELL_JAVA:-java} -cp "$D/lib/*" net.postchain.rell.tools.PostchainAppLaunchKt "$@"
