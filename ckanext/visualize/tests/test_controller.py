import requests
from routes import url_for

from ckan import plugins as p
from ckan.tests import helpers

from ckanext.visualize.controllers.visualize import VisualizeDataController
from ckanext.visualize.tests.helpers import mock_pylons


class TestVisualizeDataController():
    @classmethod
    def setup_class(self):
        if not p.plugin_loaded('visualize'):
            p.load('visualize')

    @classmethod
    def teardown_class(self):
        p.unload('visualize')

        helpers.reset_db()

    def test_visualize_data_endpoint(self):
        controller =\
            'ckanext.visualize.controllers.visualize:VisualizeDataController'
        action = 'visualize_data'
        route = url_for(controller=controller, action=action)
        response = requests.get('http://localhost:5000' + route)

        assert response.ok is True
        assert response.status_code == 200

        assert '<section role="main" class="container visualize-wrapper">' in \
            response.content

    def test_visualize_data_raw_action_call(self):
        mock_pylons()
        ctrl = VisualizeDataController()

        assert '<section role="main" class="container visualize-wrapper">' in \
            ctrl.visualize_data()
