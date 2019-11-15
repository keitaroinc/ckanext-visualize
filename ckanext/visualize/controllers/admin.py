import json

from ckan.controllers.admin import AdminController
from ckan.lib.base import render
from ckan.common import request
from ckan import logic
import ckan.lib.helpers as h
from ckan.plugins import toolkit
from ckan.common import config

DEFAULT_COLORS = [
    '#332288',
    '#117733',
    '#44aa99',
    '#88ccee',
    '#ddcc77',
    '#cc6677',
    '#aa4499',
    '#882255',
    '#dd4444'
]


class AdminController(AdminController):
    ctrl = 'ckanext.visualize.controllers.admin:AdminController'

    def visualize_data(self):
        data = request.POST
        if request.method == 'POST' and 'save' in data:
            data_dict = dict(data)
            del data_dict['save']
            colors = []

            for i, v in enumerate(data_dict):
                color = {}
                keyName = 'color_{0}'.format(i + 1)
                color[keyName] = data_dict.get(keyName)
                colors.append(color)

            data_dict = {
                'visualize_colors': json.dumps(colors)
            }
            data = toolkit.get_action(
                'config_option_update')({}, data_dict)
            h.flash_success(toolkit._('Successfully updated.'))
            h.redirect_to(controller=self.ctrl, action='visualize_data')

        # Initially set the colors from the default color palette.
        if not config.get('visualize_colors'):
            visualize_colors = []
            for i, default_color in enumerate(DEFAULT_COLORS):
                color = {}
                keyName = 'color_{0}'.format(i + 1)
                color[keyName] = default_color
                visualize_colors.append(color)
        else:
            visualize_colors = json.loads(config.get('visualize_colors'))

        vars = {
            'data': {
                'visualize_colors': visualize_colors
            },
            'errors': {}
        }

        return render('admin/visualize_data.html', extra_vars=vars)
