import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit

not_empty = plugins.toolkit.get_validator('not_empty')
ignore_missing = plugins.toolkit.get_validator('ignore_missing')
ignore_empty = plugins.toolkit.get_validator('ignore_empty')


class VisualizePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IResourceView, inherit=True)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'visualize')

    # IResourceView

    def info(self):
        schema = {
            'chart_type': [not_empty],
            'x_fields': [not_empty],
            'y_fields': [not_empty]
        }

        return {
            'name': 'visualize',
            'title': toolkit._('Visualize'),
            'icon': 'bar-chart-o',
            'filterable': True,
            'iframed': False,
            'preview_enabled': False,
            'full_page_edit': True,
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

    def form_template(self, context, data_dict):
        return 'visualize_form.html'
