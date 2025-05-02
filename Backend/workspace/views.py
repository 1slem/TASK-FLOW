from django.http import JsonResponse
from .models import Workspace
from django.views.decorators.csrf import csrf_exempt
import json
from workspace.models import UserWorkspace
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# Get all workspaces


def get_workspaces(request):
    try:
        workspaces = Workspace.objects.all()
        data = [
            {
                "id": workspace.id,
                "name": workspace.name,
                "created_at": workspace.created_at,
                "updated_at": workspace.updated_at,
            }
            for workspace in workspaces
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({"error": e}, status=400)


# Get workspace by id


def get_workspace_by_id(request, workspace_id):
    try:
        workspace = Workspace.objects.get(id=workspace_id)

    except Workspace.DoesNotExist:
        return JsonResponse({"error": "Workspace not found"}, status=404)

    return JsonResponse(
        {
            "id": workspace.id,
            "name": workspace.name,
            "created_at": workspace.created_at,
            "updated_at": workspace.updated_at,
        }
    )


# Get workspace members


@csrf_exempt
def get_workspace_members(request, workspace_id):
    if request.method == "GET":
        try:
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)

        user_workspaces = UserWorkspace.objects.filter(
            workspace=workspace
        ).select_related("user")

        members = []
        for user_workspace in user_workspaces:
            user = user_workspace.user
            member_info = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "groupRole": {
                    "id": user_workspace.id,
                    "role": user_workspace.role,
                },
            }
            members.append(member_info)

        return JsonResponse(members, safe=False, status=200)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Create new workspace
@csrf_exempt
def create_workspace(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")

        except json.JSONDecodeError:
            return JsonResponse({"error": "Workspace name is required"}, status=400)

        if not name:
            return JsonResponse({"error": "Workspace name is required"}, status=400)

        workspace = Workspace(name=name)
        workspace.save()

        # Add user as owner of the workspace
        payload = request.user
        user_id = payload.get("id")
        user = User.objects.get(id=user_id)

        UserWorkspace.objects.create(
            user=user,
            workspace=workspace,
            role="OWNER",
            join_date=timezone.now(),
        )

        return JsonResponse(
            {
                "id": workspace.id,
                "name": workspace.name,
                "created_at": workspace.created_at,
                "updated_at": workspace.updated_at,
            }
        )
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Update workspace
@csrf_exempt
def update_workspace(request, workspace_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            name = data.get("name")

        except json.JSONDecodeError:
            return JsonResponse({"error": "Workspace name is required"}, status=400)

        if not name:
            return JsonResponse({"error": "Workspace name is required"}, status=400)

        try:
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)

        workspace.name = name
        workspace.save()

        return JsonResponse(
            {
                "id": workspace.id,
                "name": workspace.name,
                "created_at": workspace.created_at,
                "updated_at": workspace.updated_at,
            }
        )
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Delete workspace
@csrf_exempt
def delete_workspace(request, workspace_id):
    if request.method == "DELETE":
        try:
            workspace = Workspace.objects.get(id=workspace_id)

        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)

        workspace.delete()

        return JsonResponse({"message": "Workspace deleted successfully"})
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def add_member_to_workspace(request, workspace_id):
    if request.method == "PUT":
        try:
            # Parse the JSON body
            data = json.loads(request.body)
            email = data.get("email")
            role = data.get("role")

            # Validate required fields
            if not email or not role:
                return JsonResponse(
                    {"error": "Email and role are required"}, status=400
                )

            # Validate role value
            if role not in ["MEMBER", "ADMIN"]:
                return JsonResponse({"error": "Invalid role"}, status=400)

            # Fetch the workspace
            payload = request.user
            user_id = payload.get("id")
            user = User.objects.get(id=user_id)

            try:
                workspace = Workspace.objects.get(id=workspace_id)
            except Workspace.DoesNotExist:
                return JsonResponse({"error": "Workspace not found"}, status=404)

            # Check if the authenticated user is the owner of the workspace
            user_workspace = UserWorkspace.objects.get(workspace=workspace, user=user)
            if user_workspace.role != "OWNER":
                return JsonResponse(
                    {
                        "error": "You do not have permission to add members to this workspace"
                    },
                    status=403,
                )

            # Validate the email and get the new user
            try:
                new_user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse(
                    {"error": "User with this email does not exist"}, status=422
                )

            # Check if the new user is already a member of the workspace
            if UserWorkspace.objects.filter(
                workspace=workspace, user=new_user
            ).exists():
                return JsonResponse(
                    {"error": "User is already a member of the workspace"}, status=400
                )

            # Add the new user to the workspace
            UserWorkspace.objects.create(
                user=new_user, workspace=workspace, role=role, join_date=timezone.now()
            )

            return JsonResponse(
                {
                    "id": new_user.id,
                    "first_name": new_user.first_name,
                    "last_name": new_user.last_name,
                    "username": new_user.username,
                    "email": new_user.email,
                },
                status=201,
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except ValidationError as e:
            return JsonResponse(
                {"error": "Validation failed", "details": e.message_dict}, status=422
            )
        except Exception as e:
            return JsonResponse(
                {"error": "An error occurred", "details": str(e)}, status=500
            )
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def delete_member_from_workspace(request, workspace_id, user_id):
    if request.method == "DELETE":
        try:
            # Get the workspace
            workspace = Workspace.objects.get(id=workspace_id)

            # Authenticated user (must be OWNER)
            payload = request.user
            current_user = User.objects.get(id=payload.get("id"))

            # Check if the current user is the OWNER
            owner_link = UserWorkspace.objects.get(user=current_user, workspace=workspace)
            if owner_link.role != "OWNER":
                return JsonResponse({"error": "Only the owner can remove members."}, status=403)

            # Can't remove the owner
            if user_id == current_user.id:
                return JsonResponse({"error": "Owner cannot remove themselves."}, status=400)

            # Check if the user is part of the workspace
            try:
                user_to_remove = User.objects.get(id=user_id)
                link = UserWorkspace.objects.get(user=user_to_remove, workspace=workspace)
            except (User.DoesNotExist, UserWorkspace.DoesNotExist):
                return JsonResponse({"error": "User not found in workspace."}, status=404)

            # Remove the member
            link.delete()

            return JsonResponse({"message": "User removed from workspace."}, status=200)

        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)



@csrf_exempt
def delete_workspace(request, workspace_id):
    if request.method == "DELETE":
        try:
            workspace = Workspace.objects.get(id=workspace_id)

            # Authenticated user (assume payload injected by middleware/auth)
            payload = request.user
            user = User.objects.get(id=payload.get("id"))

            # Check if user is OWNER of the workspace
            try:
                user_workspace = UserWorkspace.objects.get(user=user, workspace=workspace)
                if user_workspace.role != "OWNER":
                    return JsonResponse(
                        {"error": "Only the owner can delete the workspace."}, status=403
                    )
            except UserWorkspace.DoesNotExist:
                return JsonResponse({"error": "You are not a member of this workspace."}, status=403)

            # Delete the workspace
            workspace.delete()
            return JsonResponse({"message": "Workspace deleted successfully"}, status=200)

        except Workspace.DoesNotExist:
            return JsonResponse({"error": "Workspace not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Get workspaces for current user
def get_user_workspaces(request):
    try:
        # Get the user from the request (assuming middleware adds user to request)
        payload = request.user
        user_id = payload.get("id")
        
        if not user_id:
            return JsonResponse({"error": "User ID not found in token"}, status=400)
        
        # Get user's workspaces through UserWorkspace
        user_workspaces = UserWorkspace.objects.filter(user_id=user_id).select_related('workspace')
        
        # Extract workspace data
        data = [
            {
                "id": user_workspace.workspace.id,
                "name": user_workspace.workspace.name,
                "created_at": user_workspace.workspace.created_at,
                "updated_at": user_workspace.workspace.updated_at,
                "role": user_workspace.role
            }
            for user_workspace in user_workspaces
        ]
        
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
