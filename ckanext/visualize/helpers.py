from ckan.plugins import toolkit


def get_fields_without_id(resource_id):
    """ Retrieves the DataStore fields without id for a resource.

    :param resource_id: The id of a resource.
    :type resource_id: string

    :returns: List of fields
    :rtype: list """

    fields = _get_fields(resource_id)
    return [{'value': v['id'], 'type': v['type']} for v in fields if v['id'] != '_id']


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
