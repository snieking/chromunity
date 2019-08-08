#!/usr/bin/env bash

set -ex

echo "adding pubkey required for apt-get update"
sudo apt-key adv —keyserver keyserver.ubuntu.com —recv-keys 762E3157

echo "Installing Postgres 10"
sudo service postgresql stop
sudo apt-get remove -q 'postgresql-*'
sudo apt-get update -q
sudo apt-get install -q postgresql-10 postgresql-client-10
sudo cp /etc/postgresql/{9.6,10}/main/pg_hba.conf

echo "Restarting Postgres 10"
sudo service postgresql restart
