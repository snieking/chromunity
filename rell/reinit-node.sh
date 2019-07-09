#!/bin/bash

psql --host=localhost --dbname=ft --username=postchain -U postchain -c "drop schema chrotonomy cascade"

./init-node.sh
