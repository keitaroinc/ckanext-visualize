from ckan.lib.base import BaseController, render
from ckan.common import request, config
from ckan import logic
from ckan.plugins import toolkit

from ckanext.visualize import helpers


class VisualizeDataController(BaseController):
    """ VisualizeDataController is responsible for rendering a standalone
    version of the Data Viewer which can be embedded on third-party
    websites."""

    def visualize_data(self):
        """ The `visualize_data` action renders HTML content needed to render
        the Data Viewer. It will setup all the neccessary data for the Data
        Viewer.

        :returns: HTML content
        :rtype: string """

        query_params = dict(request.params)
        resource_id = query_params.get('resource_id')
        extra_vars = {
            'resource': {
                'id': resource_id
            },
            'resource_view': {},
            'bar_chart_icon': config.get('bar_chart_icon'),
            'line_chart_icon': config.get('line_chart_icon'),
            'point_chart_icon': config.get('point_chart_icon'),
        }

        if (resource_id):
            try:
                fields = helpers.get_fields_without_id(resource_id)
                extra_vars['fields'] = fields
            except logic.NotFound:
                return toolkit._('The provided resource with id `{0}` was not found.'.format(resource_id))
            except logic.NotAuthorized:
                return toolkit._('You don\'t have access to the resource with id `{0}`.'.format(resource_id))
        else:
            return toolkit._('Please provide the query parameter `resource_id`.')

        return render('visualize/data_viewer.html', extra_vars=extra_vars)
