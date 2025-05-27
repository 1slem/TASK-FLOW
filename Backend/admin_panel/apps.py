from django.apps import AppConfig
from django.contrib.admin.apps import AdminConfig


class AdminPanelConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_panel'

    def ready(self):
        # Import signals or perform other initialization here
        pass


class TaskFlowAdminConfig(AdminConfig):
    """Custom admin configuration for TaskFlow"""
    default_site = 'admin_panel.admin.TaskFlowAdminSite'
