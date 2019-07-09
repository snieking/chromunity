#!/bin/bash

psql --host=localhost --dbname=chrotonomy --username=postchain -U postchain -c "drop schema blockchain cascade"

./init-node.sh
