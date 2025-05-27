from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.template.response import TemplateResponse
from django.contrib.auth.models import User
from workspace.models import Workspace
from board.models import Board
from task.models import Task

@staff_member_required
def admin_dashboard(request):
    """
    Custom admin dashboard view with statistics
    """
    context = {
        'title': 'Dashboard',
        'workspace_count': Workspace.objects.count(),
        'board_count': Board.objects.count(),
        'task_count': Task.objects.count(),
        'user_count': User.objects.count(),
    }

    # Add any additional statistics or data you want to display

    return TemplateResponse(request, 'admin/index.html', context)
