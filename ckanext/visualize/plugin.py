import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit

from ckanext.visualize import helpers

not_empty = plugins.toolkit.get_validator('not_empty')
ignore_missing = plugins.toolkit.get_validator('ignore_missing')
ignore_empty = plugins.toolkit.get_validator('ignore_empty')


class VisualizePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IResourceView, inherit=True)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.ITemplateHelpers)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'visualize')

    def update_config_schema(self, schema):
        not_empty = toolkit.get_validator('not_empty')
        schema.update({'visualize_colors': [not_empty, unicode]})

        return schema

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
        fields = helpers.get_fields_without_id(resource.get('id'))
        remap_keys = list(fields)
        remap_keys.insert(0, {'value': ''})

        return {
            'resource': resource,
            'resource_view': resource_view,
            'fields': fields,
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

    # ITemplateHelpers

    def get_helpers(self):
        return {
            'get_color_palette': helpers.get_color_palette
        }
