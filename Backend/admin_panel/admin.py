from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _

class TaskFlowAdminSite(AdminSite):
    # Text to put at the end of each page's <title>.
    site_title = _('TaskFlow Admin')

    # Text to put in each page's <h1> (and above login form).
    site_header = _('TaskFlow Administration')

    # Text to put at the top of the admin index page.
    index_title = _('TaskFlow Dashboard')

    # URL for the "View site" link at the top of each admin page.
    site_url = '/'

# Create an instance of the custom admin site
admin_site = TaskFlowAdminSite(name='taskflow_admin')

# Import your models here to register them with the custom admin site
from workspace.models import Workspace, UserWorkspace
from board.models import Board
from task.models import Task
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin

# Custom admin classes
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

class UserWorkspaceAdmin(admin.ModelAdmin):
    list_display = ('user', 'workspace', 'role', 'join_date')
    list_filter = ('role', 'join_date')
    search_fields = ('user__username', 'workspace__name')
    date_hierarchy = 'join_date'
    ordering = ('-join_date',)
    raw_id_fields = ('user', 'workspace')

class BoardAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'workspace', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'workspace')
    search_fields = ('name', 'workspace__name')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    raw_id_fields = ('workspace',)

class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'board', 'priority', 'status', 'assigned_to', 'created_at', 'updated_at')
    list_filter = ('priority', 'status', 'created_at', 'updated_at', 'board')
    search_fields = ('name', 'description', 'board__name')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    raw_id_fields = ('board', 'assigned_to')
    list_editable = ('priority', 'status', 'assigned_to')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'board')
        }),
        ('Status Information', {
            'fields': ('priority', 'status', 'assigned_to'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

# Register models with the custom admin site
admin_site.register(User, UserAdmin)
admin_site.register(Group, GroupAdmin)
admin_site.register(Workspace, WorkspaceAdmin)
admin_site.register(UserWorkspace, UserWorkspaceAdmin)
admin_site.register(Board, BoardAdmin)
admin_site.register(Task, TaskAdmin)
