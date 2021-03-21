# encoding: utf-8
import json
import cgi
from natsort import natsorted

from flask import Blueprint

from ckan.common import config
import ckan.lib.uploader as uploader
import ckan.model as model
import ckan.logic as logic

from ckan.plugins.toolkit import (
    NotAuthorized,
    get_action, _, request,
    abort, render, h, g, redirect_to
)

from ckanext.visualize.default_color_palette import DEFAULT_COLORS

admin_visualize = Blueprint(u'admin_visualize', __name__, url_prefix=u'/ckan-admin')


@admin_visualize.before_request
def before_request():
    try:
        context = dict(model=model, user=g.user, auth_user_obj=g.userobj)
        logic.check_access(u'sysadmin', context)
    except NotAuthorized:
        abort(403, _(u'Need to be system administrator to administer'))


def visualize_data():
    data = request.form
    if request.method == 'POST' and 'save' in data:
        data_dict = dict(data)
        del data_dict['save']
        colors = []

        for key in natsorted(data_dict.keys()):
            if key.startswith('color_'):
                color = {}
                color[key] = data_dict.get(key)
                colors.append(color)

        bar_image_url = _upload_chart_icon('bar', data_dict)
        line_image_url = _upload_chart_icon('line', data_dict)
        point_image_url = _upload_chart_icon('point', data_dict)

        if bar_image_url is None or bar_image_url == '':
            bar_image_url = config.get(
                'bar_chart_icon') or '/base/images/Bar-symbol.png'

        if line_image_url is None or line_image_url == '':
            line_image_url = config.get(
                'line_chart_icon') or '/base/images/Line-symbol.png'

        if point_image_url is None or point_image_url == '':
            point_image_url = config.get(
                'point_chart_icon') or '/base/images/Point-symbol.png'

        data_dict = {
            'visualize_colors': json.dumps(colors),
            'bar_chart_icon': bar_image_url,
            'line_chart_icon': line_image_url,
            'point_chart_icon': point_image_url,
        }
        data = get_action(
            'config_option_update')({}, data_dict)
        h.flash_success(_('Successfully updated.'))
        return redirect_to('admin_visualize.visualize_data')
    elif request.method == 'POST' and dict(request.params).get('reset') == 'true':
        visualize_colors = []
        for i, default_color in enumerate(DEFAULT_COLORS):
            color = {}
            key_name = 'color_{0}'.format(i + 1)
            color[key_name] = default_color
            visualize_colors.append(color)

        data_dict = {
            'visualize_colors': json.dumps(visualize_colors),
            'bar_chart_icon': '/base/images/Bar-symbol.png',
            'line_chart_icon': '/base/images/Line-symbol.png',
            'point_chart_icon': '/base/images/Point-symbol.png',
        }
        get_action('config_option_update')({}, data_dict)
        h.flash_success(_('Successfully updated.'))
        return h.redirect_to('admin_visualize.visualize_data')

    # Initially set the colors from the default color palette.
    if not config.get('visualize_colors'):
        visualize_colors = []
        for i, default_color in enumerate(DEFAULT_COLORS):
            color = {}
            key_name = 'color_{0}'.format(i + 1)
            color[key_name] = default_color
            visualize_colors.append(color)
    else:
        visualize_colors = json.loads(config.get('visualize_colors'))

    vars = {
        'data': {
            'visualize_colors': visualize_colors,
            'bar_chart_icon': config.get('bar_chart_icon'),
            'line_chart_icon': config.get('line_chart_icon'),
            'point_chart_icon': config.get('point_chart_icon'),
        },
        'errors': {}
    }
    return render('admin/visualize_data.html', extra_vars=vars)

def _upload_chart_icon(chart_type, data):
    if '{0}_chart_upload'.format(chart_type) in data:
        image_upload = data.get('{0}_chart_upload'.format(chart_type))

        if isinstance(image_upload, cgi.FieldStorage):
            upload = uploader.get_uploader(
                'chart_icons', data.get('{0}_chart'.format(chart_type)))
            upload.update_data_dict(
                data, '{0}_chart'.format(chart_type), '{0}_chart_upload'.format(chart_type),
                '{0}_chart_clear_upload'.format)
            upload.upload(uploader.get_max_image_size())
            return upload.filename
        else:
            return data.get('{0}_chart'.format(chart_type))


admin_visualize.add_url_rule(u'/visualize_data',
                             view_func=visualize_data,
                             methods=[u'GET', u'POST'])
