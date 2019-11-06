import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit

not_empty = plugins.toolkit.get_validator('not_empty')
ignore_missing = plugins.toolkit.get_validator('ignore_missing')
ignore_empty = plugins.toolkit.get_validator('ignore_empty')


class VisualizePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IResourceView, inherit=True)
    plugins.implements(plugins.IRoutes, inherit=True)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'visualize')

    # IResourceView

    def info(self):
        schema = {}

        return {
            'name': 'visualize',
            'title': toolkit._('Visualize data'),
            'icon': 'bar-chart-o',
            'filterable': True,
            'iframed': False,
            'schema': schema
        }

    def can_view(self, data_dict):
        return data_dict['resource'].get('datastore_active', False)

    def setup_template_variables(self, context, data_dict):
        resource = data_dict['resource']
        resource_view = data_dict['resource_view']

        return {
            'resource': resource,
            'resource_view': resource_view
        }

    def view_template(self, context, data_dict):
        return 'visualize_view.html'

    # IRoutes
    def before_map(self, map):
        visualize_data_ctrl =\
            'ckanext.visualize.controllers.visualize:VisualizeDataController'
        admin_ctrl = \
            'ckanext.visualize.controllers.admin:AdminController'

        map.connect(
            '/visualize_data',
            controller=visualize_data_ctrl,
            action='visualize_data'
        )

        map.connect(
            'ckanadmin_visualize_data',
            '/ckan-admin/visualize_data',
            controller=admin_ctrl,
            action='visualize_data', ckan_icon='bar-chart-o'
        )

        return map
