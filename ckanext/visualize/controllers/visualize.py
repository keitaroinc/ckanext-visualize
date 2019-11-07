from ckan.lib.base import BaseController, render
from ckan.common import request
from ckan import logic

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
        extra_vars = {}

        if (resource_id):
            try:
                fields = helpers.get_fields_without_id(resource_id)
            except logic.NotFound:
                return 'The provided resource with id `{0}` was not found.'.format(resource_id)
            extra_vars['fields'] = fields
        else:
            return 'Please provide the query parameter `resource_id`.'

        return render('visualize/data_viewer.html', extra_vars=extra_vars)
