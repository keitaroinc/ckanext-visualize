import ckan.plugins as p
from ckan.tests import helpers
from ckan.plugins import toolkit

from ckanext.visualize.plugin import VisualizePlugin


class TestVisualizeView(helpers.FunctionalTestBase):

    @classmethod
    def setup_class(self):
        super(TestVisualizeView, self).setup_class()

        if not p.plugin_loaded('visualize'):
            p.load('visualize')

        self.plugin = VisualizePlugin()

    @classmethod
    def teardown_class(self):
        super(TestVisualizeView, self).teardown_class()

        p.unload('visualize')

        helpers.reset_db()

    def test_info(self):
        assert self.plugin.info() == {
            'name': 'visualize',
            'title': toolkit._('Visualize data'),
            'icon': 'bar-chart-o',
            'filterable': True,
            'iframed': False,
            'schema': {}
        }

    def test_can_view(self):
        data_dict = {'resource': {'datastore_active': True}}
        assert self.plugin.can_view(data_dict) is True

        data_dict = {'resource': {'datastore_active': False}}
        assert self.plugin.can_view(data_dict) is False

        data_dict = {'resource': {}}
        assert self.plugin.can_view(data_dict) is False

    def test_setup_template_variables(self):
        data_dict = {
            'resource': {},
            'resource_view': {}
        }

        result = self.plugin.setup_template_variables({}, data_dict)

        assert result == {
            'resource': {},
            'resource_view': {}
        }

    def test_view_template(self):
        assert self.plugin.view_template({}, {}) == 'visualize_view.html'
