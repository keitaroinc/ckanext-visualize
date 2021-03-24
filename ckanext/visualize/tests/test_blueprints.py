import pytest

from ckan.tests import helpers, factories
from ckan.plugins.toolkit import url_for


@pytest.mark.usefixtures('clean_db')
class TestVisualizeDataController(object):

    def test_visualize_data_endpoint_no_resource_provided(self, app):
        url = url_for(u'/visualize_data')
        response = app.get(url=url)

        assert 'Please provide the query parameter' in response.body

    def test_visualize_data_endpoint_resource_not_found(self, app):
        url = url_for(u'/visualize_data')
        response = app.get(url + '?resource_id=test')

        assert 'The provided resource with id `test` was not found.' in \
            response.body

    def test_visualize_data_endpoint_not_authorized(self, app):
        url = url_for(u'/visualize_data')
        org = factories.Organization()
        dataset = factories.Dataset(private=True, owner_org=org.get('id'))
        resource = factories.Resource(
            schema='',
            validation_options='',
            package_id=dataset.get('id'),
            datastore_active=True,
        )
        resource_id = resource.get('id')
        data = {
            'fields': [
                {'id': 'Age', 'type': 'numeric'},
                {'id': 'Name', 'type': 'text'},
            ],
            'records': [
                {'Age': 35, 'Name': 'John'},
                {'Age': 28, 'Name': 'Sara'},
            ],
            'force': True,
            'resource_id': resource_id,
        }
        helpers.call_action('datastore_create', **data)
        response = app.get(url + '?resource_id={0}'.format(resource_id))

        assert 'You don\'t have access to the resource with id' in response.body

    def test_visualize_data_endpoint(self, app):
        url = url_for(u'/visualize_data')
        dataset = factories.Dataset()
        resource = factories.Resource(
            schema='',
            validation_options='',
            package_id=dataset.get('id'),
            datastore_active=True,
        )
        resource_id = resource.get('id')
        data = {
            'fields': [
                {'id': 'Age', 'type': 'numeric'},
                {'id': 'Name', 'type': 'text'},
            ],
            'records': [
                {'Age': 35, 'Name': 'John'},
                {'Age': 28, 'Name': 'Sara'},
            ],
            'force': True,
            'resource_id': resource_id,
        }
        helpers.call_action('datastore_create', **data)
        response = app.get(url + '?resource_id={0}'.format(resource_id))

        assert '<div class="chart-container hidden">' in \
            response.body


@pytest.mark.usefixtures('clean_db')
class TestAdminController(object):

    def test_visualize_data_endpoint_admin(self, app):
        user = factories.Sysadmin()
        env = {'REMOTE_USER': user.get('name').encode('ascii')}
        url = url_for(u'admin_visualize.visualize_data')
        response = app.get(url=url, extra_environ=env)

        assert 'Visualize' in response.body

    @helpers.change_config('visualize_colors', '{"color_1":"#fff"}')
    def test_visualize_data_endpoint_predefined_color(self, app):
        user = factories.Sysadmin()
        env = {'REMOTE_USER': user.get('name').encode('ascii')}
        url = url_for(u'admin_visualize.visualize_data')
        response = app.get(url=url, extra_environ=env)

        assert 'Visualize' in response.body

    def test_visualize_data_endpoint_post(self, app):
        user = factories.Sysadmin()
        env = {'REMOTE_USER': user.get('name').encode('ascii')}
        url = url_for(u'admin_visualize.visualize_data')
        params = {
            'save': True,
            'color_1': '#332288',
            'color_2': '#117733',
        }
        response = app.post(url=url, extra_environ=env, params=params, follow_redirects=False)

        assert 302 == response.status_code

    def test_visualize_data_endpoint_post_icon_url(self, app):
        user = factories.Sysadmin()
        env = {'REMOTE_USER': user.get('name').encode('ascii')}
        url = url_for(u'admin_visualize.visualize_data')
        params = {
            'save': True,
            'bar_chart_upload': 'http://example.com/image.png'
        }
        response = app.post(url=url, extra_environ=env,
                            params=params, follow_redirects=False)

        assert 302 == response.status_code

    def test_visualize_data_endpoint_post_icon_upload(self, app):
        user = factories.Sysadmin()
        env = {'REMOTE_USER': user.get('name').encode('ascii')}
        url = url_for(u'admin_visualize.visualize_data')
        params = {
            'save': True,
            'bar_chart': 'Line-symbol.png',
            'bar_chart_upload': "<FileStorage: 'Line-symbol.png' ('image/png')>"
        }
        response = app.post(url=url, extra_environ=env, params=params, follow_redirects=False)

        assert 302 == response.status_code

    def test_visualize_data_endpoint_reset(self, app):
        user = factories.Sysadmin()
        env = {'REMOTE_USER': user.get('name').encode('ascii')}
        url_no_params = url_for(u'admin_visualize.visualize_data')
        url_with_params = url_no_params + '?reset=true'
        response = app.post(url=url_with_params, extra_environ=env, follow_redirects=False)

        assert 302 == response.status_code
