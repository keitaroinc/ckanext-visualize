from ckan.controllers.admin import AdminController
from ckan.lib.base import render


class AdminController(AdminController):
    def visualize_data(self):
        return render('admin/visualize_data.html')
