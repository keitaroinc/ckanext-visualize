# encoding: utf-8
import logging

from flask import Blueprint

from ckan.common import request, config
from ckan import logic
from ckan.plugins.toolkit import render, _

from ckanext.visualize import helpers

log = logging.getLogger(__name__)
# Visualize is responsible for rendering a standalone
# version of the Data Viewer which can be embedded on third-party
# websites.
visualize = Blueprint(u'visualize', __name__)


def visualize_data():
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
        'bar_chart_icon': config.get('bar_chart_icon') or '/base/images/Bar-symbol.png',
        'line_chart_icon': config.get('line_chart_icon') or '/base/images/Line-symbol.png',
        'point_chart_icon': config.get('point_chart_icon') or '/base/images/Point-symbol.png',
    }

    if resource_id:
        try:
            fields = helpers.get_fields_without_id(resource_id)
            extra_vars['fields'] = fields
        except logic.NotFound:
            return _('The provided resource with id `{0}` was not found.'.format(resource_id))
        except logic.NotAuthorized:
            return _('You don\'t have access to the resource with id `{0}`.'.format(resource_id))
    else:
        return _('Please provide the query parameter `resource_id`.')

    return render('visualize/data_viewer.html', extra_vars=extra_vars)


visualize.add_url_rule(u'/visualize_data', view_func=visualize_data)