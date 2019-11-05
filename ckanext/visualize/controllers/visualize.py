from ckan.lib.base import BaseController, render


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

        return render('visualize/data_viewer.html')
