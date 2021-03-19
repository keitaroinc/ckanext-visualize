import pytest

from ckan import plugins as p
from ckan.tests import helpers, factories

from ckanext.visualize.views.visualize import visualize_data
# from ckanext.visualize.tests.helpers import mock_pylons
#from ckanext.visualize import helpers as h
# from ckan.plugins.toolkit import url_for

from ckan.lib.helpers import url_for

#@pytest.mark.ckan_config('ckan.plugins', 'image_view')
#@pytest.mark.usefixtures('with_plugins')
#@pytest.mark.usefixtures('clean_db')
class TestVisualizeDataController(object):

    def test_visualize_data_endpoint_no_resource_provided(self, app):
        url = url_for(u'/visualize_data')
        response = app.get(url=url)

        assert 'Please provide the query parameter' in response.body

    def test_visualize_data_endpoint_resource_not_found(self, app):
        action = 'visualize_data'
        url = url_for(u'/visualize_data')
        response = app.get(url + '?resource_id=test')

        assert 'The provided resource with id `test` was not found.' in \
            response.body

#     def test_visualize_data_endpoint_not_authorized(self, app):
#         #app = self._get_test_app()
#         controller =\
#             'ckanext.visualize.views.visualize:VisualizeDataController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         org = factories.Organization()
#         dataset = factories.Dataset(private=True, owner_org=org.get('id'))
#         resource = factories.Resource(
#             schema='',
#             validation_options='',
#             package_id=dataset.get('id'),
#             datastore_active=True,
#         )
#         resource_id = resource.get('id')
#         data = {
#             'fields': [
#                 {'id': 'Age', 'type': 'numeric'},
#                 {'id': 'Name', 'type': 'text'},
#             ],
#             'records': [
#                 {'Age': 35, 'Name': 'John'},
#                 {'Age': 28, 'Name': 'Sara'},
#             ],
#             'force': True,
#             'resource_id': resource_id,
#         }
#         helpers.call_action('datastore_create', **data)
#         response = app.get(url + '?resource_id={0}'.format(resource_id))

#         assert 'You don\'t have access to the resource with id `{0}`.'.format(
#             resource_id) == response.body

#     def test_visualize_data_endpoint(self, app):
#         #app = self._get_test_app()
#         controller =\
#             'ckanext.visualize.views.visualize:VisualizeDataController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         dataset = factories.Dataset()
#         resource = factories.Resource(
#             schema='',
#             validation_options='',
#             package_id=dataset.get('id'),
#             datastore_active=True,
#         )
#         resource_id = resource.get('id')
#         data = {
#             'fields': [
#                 {'id': 'Age', 'type': 'numeric'},
#                 {'id': 'Name', 'type': 'text'},
#             ],
#             'records': [
#                 {'Age': 35, 'Name': 'John'},
#                 {'Age': 28, 'Name': 'Sara'},
#             ],
#             'force': True,
#             'resource_id': resource_id,
#         }
#         helpers.call_action('datastore_create', **data)
#         response = app.get(url + '?resource_id={0}'.format(resource_id))

#         assert '<div class="chart-container hidden">' in \
#             response.body

# @pytest.mark.ckan_config('ckan.plugins', 'image_view')
# @pytest.mark.usefixtures('with_plugins')
# @pytest.mark.usefixtures('clean_db')
# class TestAdminController(object):

#     #@classmethod
#     #def setup_class(self):
#      #   super(TestAdminController, self).setup_class()

#       #  if not p.plugin_loaded('visualize'):
#        #     p.load('visualize')

#     #@classmethod
#     #def teardown_class(self):
#      #   super(TestAdminController, self).teardown_class()

#      #   p.unload('visualize')

#       #  helpers.reset_db()

#     def test_visualize_data_endpoint_admin(self, app):
#         #app = self._get_test_app()
#         user = factories.Sysadmin()
#         env = {'REMOTE_USER': user.get('name').encode('ascii')}
#         controller =\
#             'ckanext.visualize.views.admin_visualize:AdminController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         response = app.get(url=url, extra_environ=env)

#         assert 'Visualize' in response.body

#     @helpers.change_config('visualize_colors', '{"color_1":"#fff"}')
#     def test_visualize_data_endpoint_predefined_color(self, app):
#         #app = self._get_test_app()
#         user = factories.Sysadmin()
#         env = {'REMOTE_USER': user.get('name').encode('ascii')}
#         controller =\
#             'ckanext.visualize.views.admin_vizualize:AdminController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         response = app.get(url=url, extra_environ=env)

#         assert 'Visualize' in response.body

#     def test_visualize_data_endpoint_post(self, app):
#         #app = self._get_test_app()
#         user = factories.Sysadmin()
#         env = {'REMOTE_USER': user.get('name').encode('ascii')}
#         controller =\
#             'ckanext.visualize.views.admin_visualize:AdminController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         params = {
#             'save': True,
#             'color_1': '#332288',
#             'color_2': '#117733',
#         }
#         response = app.post(url=url, extra_environ=env, params=params)

#         assert '302 Found' in response.body

#     def test_visualize_data_endpoint_post_icon_url(self):
#         #app = self._get_test_app()
#         user = factories.Sysadmin()
#         env = {'REMOTE_USER': user.get('name').encode('ascii')}
#         controller =\
#             'ckanext.visualize.views.admin_visualize:AdminController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         params = {
#             'save': True,
#             'bar_chart_upload': 'http://example.com/image.png'
#         }
#         response = app.post(url=url, extra_environ=env,
#                             params=params)

#         assert '302 Found' in response.body

#     def test_visualize_data_endpoint_post_icon_upload(self, app):
#         #app = self._get_test_app()
#         user = factories.Sysadmin()
#         env = {'REMOTE_USER': user.get('name').encode('ascii')}
#         controller =\
#             'ckanext.visualize.views.admin_visualize:AdminController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         params = {
#             'save': True,
#         }
#         upload_content = 'image data'
#         upload_info = ('bar_chart_upload', 'image.png', upload_content)
#         response = app.post(url=url, extra_environ=env,
#                             params=params, upload_files=[upload_info])

#         assert '302 Found' in response.body

#     def test_visualize_data_endpoint_reset(self, app):
#         #app = self._get_test_app()
#         user = factories.Sysadmin()
#         env = {'REMOTE_USER': user.get('name').encode('ascii')}
#         controller =\
#             'ckanext.visualize.views.admin_visualize:AdminController'
#         action = 'visualize_data'
#         url = h.url_for(u'blueprints.blueprints')
#         params = {
#             'reset': 'true',
#             'color_1': '#332288',
#             'color_2': '#117733',
#         }
#         response = app.post(url=url, extra_environ=env, params=params)

#         assert '302 Found' in response.body
