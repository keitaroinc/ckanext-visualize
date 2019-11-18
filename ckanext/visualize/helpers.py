import json

from ckan.plugins import toolkit
from ckan.common import config

from ckanext.visualize.default_color_palette import DEFAULT_COLORS


def get_fields_without_id(resource_id):
    """ Retrieves the DataStore fields without id for a resource.

    :param resource_id: The id of a resource.
    :type resource_id: string

    :returns: List of fields
    :rtype: list """

    fields = _get_fields(resource_id)
    return [{'value': v['id'], 'type': v['type']} for v in fields if v['id'] != '_id']


def get_color_palette():
    """ Gets the existing color palette from the configuration.

    :returns: List of colors
    :rtype: list """

    visualize_colors = config.get('visualize_colors')

    if visualize_colors:
        visualize_colors = json.loads(visualize_colors)
        color_palette = []
        for i, color in enumerate(visualize_colors):
            color_palette.append(color.get('color_{0}'.format(i + 1)))
        return color_palette
    else:
        return DEFAULT_COLORS


def _get_fields(resource_id):
    """ Retrieves the DataStore fields for a resource.

    :param resource_id: The id of a resource.
    :type resource_id: string

    :returns: List of fields
    :rtype: list """

    data = {
        'resource_id': resource_id,
        'limit': 0
    }
    result = toolkit.get_action('datastore_search')({}, data)
    return result['fields']
