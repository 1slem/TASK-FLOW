from django.urls import path
from .views import (
    get_workspaces,
    create_workspace,
    update_workspace,
    delete_workspace,
    get_workspace_by_id,
    get_workspace_members,
    add_member_to_workspace,
    delete_member_from_workspace,
    delete_workspace,
)

urlpatterns = [
    path("", get_workspaces, name="get_workspaces"),
    path("<int:workspace_id>", get_workspace_by_id, name="get_workspace_by_id"),
    path("members/<int:workspace_id>",get_workspace_members,name="get_workspace_members"),
    path("create", create_workspace, name="create_workspace"),
    path("update/<int:workspace_id>", update_workspace, name="update_workspace"),
    path("delete/<int:workspace_id>", delete_workspace, name="delete_workspace"),
    path("new-member/<int:workspace_id>",add_member_to_workspace,name="add_member_to_workspace"),
    path("remove-member/<int:workspace_id>/<int:user_id>",delete_member_from_workspace,
         name="delete_member_from_workspace"),
    path("delete-workspace/<int:workspace_id>",delete_workspace,name="delete_workspace"),
]
