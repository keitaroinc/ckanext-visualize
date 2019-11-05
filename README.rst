.. You should enable this project on travis-ci.org and coveralls.io to make
   these badges work. The necessary Travis and Coverage config files have been
   generated for you.

.. image:: https://travis-ci.org/keitaroinc/ckanext-visualize.svg?branch=master
    :target: https://travis-ci.org/keitaroinc/ckanext-visualize

.. image:: https://coveralls.io/repos/github/keitaroinc/ckanext-visualize/badge.svg
    :target: https://coveralls.io/github/keitaroinc/ckanext-visualize

=============
ckanext-visualize
=============

.. Put a description of your extension here:
   What does it do? What features does it have?
   Consider including some screenshots or embedding a video!

CKAN extension which allows users to easily visualize data that's in DataStore
using a chart.

------------
Requirements
------------

This extension is developed and tested on CKAN 2.8


------------
Installation
------------

.. Add any additional install steps to the list below.
   For example installing any non-Python dependencies or adding any required
   config settings.

To install ckanext-visualize:

1. Activate your CKAN virtual environment, for example::

     . /usr/lib/ckan/default/bin/activate

2. Install the ckanext-visualize Python package into your virtual environment::

     pip install ckanext-visualize

3. Add ``visualize`` to the ``ckan.plugins`` setting in your CKAN
   config file (by default the config file is located at
   ``/etc/ckan/default/production.ini``).

4. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu::

     sudo service apache2 reload


------------------------
Development Installation
------------------------

To install ckanext-visualize for development, activate your CKAN virtualenv and
do::

    git clone https://github.com/keitaroinc/ckanext-visualize.git
    cd ckanext-visualize
    python setup.py develop
    pip install -r dev-requirements.txt


-----------------
Running the Tests
-----------------

To run the tests, do::

    nosetests --nologcapture --with-pylons=test.ini

To run the tests and produce a coverage report, first make sure you have
coverage installed in your virtualenv (``pip install coverage``) then run::

    nosetests --nologcapture --with-pylons=test.ini --with-coverage --cover-package=ckanext.visualize --cover-inclusive --cover-erase
