"""
Copyright (c) 2019 Keitaro AB

Use of this source code is governed by an MIT license
that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
"""

import json

from ckan.plugins import toolkit
from ckan.common import config

from ckanext.visualize.default_color_palette import DEFAULT_COLORS

ICONS_DATA_TYPES = {
    'text': 'fa-file-text',
    'numeric': 'fa-calculator',
    'bool': 'fa-toggle-on',
    'date': 'fa-calendar',
    'time': 'fa-clock-o',
    'timestamp': 'fa-hourglass-half',
    'int': 'fa-file-excel-o',
    'float': 'fa-percent'
}


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


def get_icon_for_data_type(data_type):
    """ Gets the name of the icon that coresponds to the data type.

    :param data_type: The type of the data.
    :type data_type: string

    :returns: Type of data
    :rtype: string """

    if data_type in ICONS_DATA_TYPES:
        return ICONS_DATA_TYPES.get(data_type)

    return ''

