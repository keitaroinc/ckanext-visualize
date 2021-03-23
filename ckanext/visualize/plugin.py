import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.common import config

from ckanext.visualize import helpers
from ckanext.visualize.views.visualize import visualize
from ckanext.visualize.views.admin_visualize import admin_visualize

not_empty = plugins.toolkit.get_validator('not_empty')
ignore_missing = plugins.toolkit.get_validator('ignore_missing')
ignore_empty = plugins.toolkit.get_validator('ignore_empty')


class VisualizePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IResourceView, inherit=True)
    plugins.implements(plugins.ITemplateHelpers)
    plugins.implements(plugins.IBlueprint)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('assets', 'visualize')

    def update_config_schema(self, schema):
        not_empty = toolkit.get_validator('not_empty')
        schema.update({
            'visualize_colors': [ignore_missing, str],
            'bar_chart_icon': [ignore_missing, str],
            'line_chart_icon': [ignore_missing, str],
            'point_chart_icon': [ignore_missing, str]
        })

        return schema

    # IResourceView

    def info(self):
        schema = {
            'visualize_x_axis': [ignore_missing],
            'visualize_y_axis': [ignore_missing],
            'visualize_color_attr': [ignore_missing]
        }
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
            'bar_chart_icon': config.get('bar_chart_icon') or '/base/images/Bar-symbol.png',
            'line_chart_icon': config.get('line_chart_icon') or '/base/images/Line-symbol.png',
            'point_chart_icon': config.get('point_chart_icon') or '/base/images/Point-symbol.png'
        }

    def view_template(self, context, data_dict):
        return 'visualize_view.html'

    # ITemplateHelpers

    def get_helpers(self):
        return {
            'get_color_palette': helpers.get_color_palette,
            'get_icon_for_data_type': helpers.get_icon_for_data_type,
        }

    # IBlueprint

    def get_blueprint(self):
        return [visualize, admin_visualize]
