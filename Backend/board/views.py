from django.http import JsonResponse
from .models import Board
from workspace.models import Workspace, UserWorkspace
from django.contrib.auth.models import User
import json
from django.views.decorators.csrf import csrf_exempt
import jwt


# Get all boards
def get_boards(request, workspace_id):
    try:
        # Check if the authenticated user is a member of this workspace
        payload = request.user
        user_id = payload.get("id")

        if not user_id:
            return JsonResponse({"error": "User ID not found in token"}, status=400)

        try:
            workspace = Workspace.objects.get(id=workspace_id)
            user = User.objects.get(id=user_id)
            # Check if user is a member of this workspace
            user_workspace = UserWorkspace.objects.get(workspace=workspace, user=user)
        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except UserWorkspace.DoesNotExist:
            return JsonResponse({"error": "You do not have permission to access this workspace"}, status=403)

        boards = Board.objects.filter(workspace=workspace_id)

        data = [
            {
                "id": board.id,
                "name": board.name,
                "workspace": {
                    "id": board.workspace.id,
                    "name": board.workspace.name,
                    "created_at": board.workspace.created_at,
                    "updated_at": board.workspace.updated_at,
                },
                "tasks": [
                    {
                        "id": task.id,
                        "name": task.name,
                        "description": task.description,
                        "priority": task.priority,
                        "status": task.status,
                        "board_id": task.board.id,
                        "assigned_to": {
                            "id": task.assigned_to.id,
                            "username": task.assigned_to.username,
                            "first_name": task.assigned_to.first_name,
                            "last_name": task.assigned_to.last_name,
                        } if task.assigned_to else None,
                        "created_at": task.created_at,
                        "updated_at": task.updated_at,
                    }
                    for task in board.tasks.all()
                ],
                "created_at": board.created_at,
                "updated_at": board.updated_at,
            }
            for board in boards
        ]
        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# get board by id
def get_board_by_id(request, board_id):
    try:
        board = Board.objects.get(id=board_id)
    except Board.DoesNotExist:
        return JsonResponse({"error": "Board not found"}, status=404)

    # Check if the authenticated user is a member of this workspace
    payload = request.user
    user_id = payload.get("id")

    if not user_id:
        return JsonResponse({"error": "User ID not found in token"}, status=400)

    try:
        user = User.objects.get(id=user_id)
        # Check if user is a member of this workspace
        user_workspace = UserWorkspace.objects.get(workspace=board.workspace, user=user)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except UserWorkspace.DoesNotExist:
        return JsonResponse({"error": "You do not have permission to access this workspace"}, status=403)

    data = {
        "id": board.id,
        "name": board.name,
        "workspace": {
            "id": board.workspace.id,
            "name": board.workspace.name,
            "created_at": board.workspace.created_at,
            "updated_at": board.workspace.updated_at,
        },
        "tasks": [
            {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "board_id": task.board.id,
                "assigned_to": {
                    "id": task.assigned_to.id,
                    "username": task.assigned_to.username,
                    "first_name": task.assigned_to.first_name,
                    "last_name": task.assigned_to.last_name,
                } if task.assigned_to else None,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }
            for task in board.tasks.all()
        ],
        "created_at": board.created_at,
        "updated_at": board.updated_at,
    }

    return JsonResponse(data, safe=False)


# Create new board
@csrf_exempt
def create_board(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            workspace = data.get("workspace")

        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Board name and workspace is required"}, status=400
            )

        if not name:
            return JsonResponse({"error": "Board name is required"}, status=400)

        if not workspace:
            return JsonResponse({"error": "Workspace is required"}, status=400)

        try:
            workspace_to_save = Workspace.objects.get(id=workspace)
        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)

        # Check if the authenticated user is a member of this workspace
        payload = request.user
        user_id = payload.get("id")

        if not user_id:
            return JsonResponse({"error": "User ID not found in token"}, status=400)

        try:
            user = User.objects.get(id=user_id)
            # Check if user is a member of this workspace
            user_workspace = UserWorkspace.objects.get(workspace=workspace_to_save, user=user)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except UserWorkspace.DoesNotExist:
            return JsonResponse({"error": "You do not have permission to access this workspace"}, status=403)

        board = Board(name=name, workspace=workspace_to_save)
        board.save()

        workspace_data = {
            "id": workspace_to_save.id,
            "name": workspace_to_save.name,
            "created_at": workspace_to_save.created_at,
            "updated_at": workspace_to_save.updated_at,
        }

        return JsonResponse(
            {
                "id": board.id,
                "name": board.name,
                "workspace": workspace_data,
                "created_at": board.created_at,
                "updated_at": board.updated_at,
            }
        )
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Update board
@csrf_exempt
def update_board(request, board_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            name = data.get("name")

        except json.JSONDecodeError:
            return JsonResponse({"error": "Board name is required"}, status=400)

        if not name:
            return JsonResponse({"error": "Board name is required"}, status=400)

        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        # Check if the authenticated user is a member of this workspace
        payload = request.user
        user_id = payload.get("id")

        if not user_id:
            return JsonResponse({"error": "User ID not found in token"}, status=400)

        try:
            user = User.objects.get(id=user_id)
            # Check if user is a member of this workspace
            user_workspace = UserWorkspace.objects.get(workspace=board.workspace, user=user)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except UserWorkspace.DoesNotExist:
            return JsonResponse({"error": "You do not have permission to access this workspace"}, status=403)

        board.name = name
        board.save()

        workspace_data = {
            "id": board.workspace.id,
            "name": board.workspace.name,
            "created_at": board.workspace.created_at,
            "updated_at": board.workspace.updated_at,
        }

        return JsonResponse(
            {
                "id": board.id,
                "name": board.name,
                "workspace": workspace_data,
                "created_at": board.created_at,
                "updated_at": board.updated_at,
            }
        )
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Delete board
@csrf_exempt
def delete_board(request, board_id):
    if request.method == "DELETE":
        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        # Check if the authenticated user is a member of this workspace
        payload = request.user
        user_id = payload.get("id")

        if not user_id:
            return JsonResponse({"error": "User ID not found in token"}, status=400)

        try:
            user = User.objects.get(id=user_id)
            # Check if user is a member of this workspace
            user_workspace = UserWorkspace.objects.get(workspace=board.workspace, user=user)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except UserWorkspace.DoesNotExist:
            return JsonResponse({"error": "You do not have permission to access this workspace"}, status=403)

        board.delete()

        return JsonResponse({"message": "Board deleted successfully"})
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)
