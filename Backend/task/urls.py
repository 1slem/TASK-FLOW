from django.urls import path
from .views import create_task, update_task, delete_task, assign_task, update_task_status, assign_user_to_task

urlpatterns = [
    path("create/<int:board_id>", create_task, name="create_task"),
    path("update/<int:board_id>/t/<int:task_id>", update_task, name="update_task"),
    path("delete/<int:board_id>/t/<int:task_id>", delete_task, name="delete_task"),
    path("assign/<int:task_id>", assign_task, name="assign_task"),
    path("status/<int:board_id>/t/<int:task_id>", update_task_status, name="update_task_status"),
    path("assign-user/<int:board_id>/t/<int:task_id>", assign_user_to_task, name="assign_user_to_task"),
]
