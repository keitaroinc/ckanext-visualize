import pytest
from ckan import plugins as p
from ckan.tests import helpers as core_helpers

from ckanext.visualize.default_color_palette import DEFAULT_COLORS
from ckanext.visualize import helpers as extension_helpers

#core_helpers.FunctionalTestBase
@pytest.mark.usefixtures('clean_db')
class TestHelpers(object):
    def test_get_color_palette(self):
        assert extension_helpers.get_color_palette() == DEFAULT_COLORS

    @core_helpers.change_config('visualize_colors', '[{"color_1":"#fff"}]')
    def test_get_color_palette_from_config(self):
        assert extension_helpers.get_color_palette() == ['#fff']

    def test_get_icon_for_data_type(self):
        assert extension_helpers.get_icon_for_data_type(
            'text') == 'fa-file-text'

    def test_get_icon_for_data_type_no_type(self):
        assert extension_helpers.get_icon_for_data_type(
            'non_existing_type') == ''
