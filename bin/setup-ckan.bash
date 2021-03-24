#!/bin/bash
set -e

echo "This is setup-ckan.bash..."

echo "Installing the packages that CKAN requires..."
sudo apt-get update -qq
sudo apt-get install xmlsec1 libxmlsec1-dev

echo "Installing CKAN and its Python dependencies..."
git clone https://github.com/ckan/ckan
cd ckan
if [ $CKANVERSION == 'master' ]
then
    echo "CKAN version: master"
else
    CKAN_TAG=$(git tag | grep ^ckan-$CKANVERSION | sort --version-sort | tail -n 1)
    git checkout $CKAN_TAG
    echo "CKAN version: ${CKAN_TAG#ckan-}"
fi

# install the recommended version of setuptools
if [ -f requirement-setuptools.txt ]
then
    echo "Updating setuptools..."
    pip install -r requirement-setuptools.txt
fi

if [ $CKANVERSION == '2.7' ]
then
    echo "Installing setuptools"
    pip install setuptools==39.0.1
fi

python setup.py develop
pip install -r requirements.txt
cd -

echo "Creating the PostgreSQL users and databases..."
psql -h localhost -U postgres -c "CREATE USER ckan_default WITH PASSWORD 'pass';"
psql -h localhost -U postgres -c "CREATE USER datastore_default WITH PASSWORD 'pass';"
psql -h localhost -U postgres -c 'CREATE DATABASE ckan_test WITH OWNER ckan_default;'
psql -h localhost -U postgres -c 'CREATE DATABASE datastore_test WITH OWNER ckan_default;'

echo "Initialising the database..."
cd ckan
ckan -c test-core.ini db init
ckan -c test-core.ini datastore set-permissions > datastore_permisions.sql
psql -h localhost -U postgres -f datastore_permisions.sql
cd -

echo "Installing ckanext-resourcedictionary and its requirements..."
python setup.py develop
pip install -r dev-requirements.txt

echo "Moving test.ini into a subdir..."
mkdir subdir
mv test.ini subdir

echo "setup-ckan.bash is done."
