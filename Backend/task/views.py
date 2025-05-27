import json
from django.http import JsonResponse
from .models import Task
from board.models import Board
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import jwt

# Create new task


@csrf_exempt
def create_task(request, board_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            description = data.get("description")
            priority = data.get("priority")
            status = data.get("status")
            assigned_to_id = data.get("assigned_to_id")

        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Task name, description, and priority are required"}, status=400
            )

        # Validate data
        if not name:
            return JsonResponse({"error": "Task name is required"}, status=400)

        if not description:
            return JsonResponse({"error": "Task description is required"}, status=400)

        if not priority:
            return JsonResponse({"error": "Task priority is required"}, status=400)
        elif priority not in ["low", "medium", "high"]:
            return JsonResponse(
                {"error": "Task priority must be [low, medium, or high]"}, status=400
            )

        # Check if the board exists
        try:
            board_to_save = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        # Validate status if provided
        if status and status not in ["not-done", "semi-done", "done"]:
            return JsonResponse(
                {"error": "Task status must be [not-done, semi-done, or done]"}, status=400
            )

        # Validate assigned_to_id if provided
        assigned_to = None
        if assigned_to_id:
            try:
                assigned_to = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Assigned user not found"}, status=404)

        # Create task
        task = Task(
            name=name,
            description=description,
            priority=priority,
            status=status if status else "not-done",
            board=board_to_save,
            assigned_to=assigned_to
        )
        task.save()

        # Return the response with task and board details
        assigned_to_data = None
        if task.assigned_to:
            assigned_to_data = {
                "id": task.assigned_to.id,
                "username": task.assigned_to.username,
                "email": task.assigned_to.email,
                "first_name": task.assigned_to.first_name,
                "last_name": task.assigned_to.last_name,
            }

        return JsonResponse(
            {
                "task": {
                    "id": task.id,
                    "name": task.name,
                    "description": task.description,
                    "priority": task.priority,
                    "status": task.status,
                    "assigned_to": assigned_to_data,
                    "created_at": task.created_at,
                    "updated_at": task.updated_at,
                },
                "board": {
                    "id": task.board.id,
                    "name": task.board.name,
                },
                "workspace": {
                    "id": task.board.workspace.id,
                    "name": task.board.workspace.name,
                }
            },
            status=201
        )

    return JsonResponse({"error": "Method not allowed"}, status=405)

# Update task
# the url pattern is /task/update/<int:board_id>/t/<int:task_id>
@csrf_exempt
def update_task(request, board_id, task_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            description = data.get("description")
            priority = data.get("priority")
            status = data.get("status")
            assigned_to_id = data.get("assigned_to_id")

        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Task name, description and priority is required"}, status=400
            )

        if not name:
            return JsonResponse({"error": "Task name is required"}, status=400)

        if not description:
            return JsonResponse({"error": "Task description is required"}, status=400)

        if not priority:
            return JsonResponse({"error": "Task priority is required"}, status=400)
        elif priority not in ["low", "medium", "high"]:
            return JsonResponse(
                {"error": "Task priority must be [low, medium or high]"}, status=400
            )

        try:
            board_to_save = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        try:
            task = Task.objects.get(id=task_id, board=board_to_save)
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)

        # Validate status if provided
        if status and status not in ["not-done", "semi-done", "done"]:
            return JsonResponse(
                {"error": "Task status must be [not-done, semi-done, or done]"}, status=400
            )

        # Validate assigned_to_id if provided
        if assigned_to_id is not None:  # Check for None to allow unsetting (empty string or null)
            if assigned_to_id == "" or assigned_to_id is None:
                task.assigned_to = None
            else:
                try:
                    assigned_to = User.objects.get(id=assigned_to_id)
                    task.assigned_to = assigned_to
                except User.DoesNotExist:
                    return JsonResponse({"error": "Assigned user not found"}, status=404)

        task.name = name
        task.description = description
        task.priority = priority
        if status:
            task.status = status
        task.save()

        # Prepare assigned_to data
        assigned_to_data = None
        if task.assigned_to:
            assigned_to_data = {
                "id": task.assigned_to.id,
                "username": task.assigned_to.username,
                "email": task.assigned_to.email,
                "first_name": task.assigned_to.first_name,
                "last_name": task.assigned_to.last_name,
            }

        return JsonResponse(
            {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "assigned_to": assigned_to_data,
                "board": {
                    "id": task.board.id,
                    "name": task.board.name,
                    "workspace": {
                        "id": task.board.workspace.id,
                        "name": task.board.workspace.name,
                        "created_at": task.board.workspace.created_at,
                        "updated_at": task.board.workspace.updated_at,
                    },
                    "created_at": task.board.created_at,
                    "updated_at": task.board.updated_at,
                },
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }
        )

    return JsonResponse({"error": "Method not allowed"}, status=405)


# Delete task
# the url pattern is /task/delete/<int:board_id>/t/<int:task_id>
@csrf_exempt
def delete_task(request, board_id, task_id):
    if request.method == "DELETE":
        try:
            board_to_save = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        try:
            task = Task.objects.get(id=task_id, board=board_to_save)
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)

        task.delete()

        return JsonResponse({"message": "Task deleted successfully"})

    return JsonResponse({"error": "Method not allowed"}, status=405)


# Update task board
# the url pattern is /task/assign/<int:task_id>
# the request body should contain the prev_board_id and the new_board_id


@csrf_exempt
def assign_task(request, task_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            prev_board_id = data.get("prevBoard")
            new_board_id = data.get("newBoard")

        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "prevBoard and newBoard is required"}, status=400
            )

        if not prev_board_id:
            return JsonResponse({"error": "prev_board_id is required"}, status=400)

        if not new_board_id:
            return JsonResponse({"error": "new_board_id is required"}, status=400)

        try:
            prev_board = Board.objects.get(id=prev_board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Previous Board not found"}, status=404)

        try:
            new_board = Board.objects.get(id=new_board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "New Board not found"}, status=404)

        try:
            task = Task.objects.get(id=task_id, board=prev_board)
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)

        task.board = new_board
        task.save()

        return JsonResponse(
            {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "priority": task.priority,
                "board": {
                    "id": task.board.id,
                    "name": task.board.name,
                    "workspace": {
                        "id": task.board.workspace.id,
                        "name": task.board.workspace.name,
                        "created_at": task.board.workspace.created_at,
                        "updated_at": task.board.workspace.updated_at,
                    },
                    "created_at": task.board.created_at,
                    "updated_at": task.board.updated_at,
                },
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }
        )

    return JsonResponse({"error": "Method not allowed"}, status=405)


# Update task status
# the url pattern is /task/status/<int:board_id>/t/<int:task_id>
@csrf_exempt
def update_task_status(request, board_id, task_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            status = data.get("status")

        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Task status is required"}, status=400
            )

        if not status:
            return JsonResponse({"error": "Task status is required"}, status=400)
        elif status not in ["not-done", "semi-done", "done"]:
            return JsonResponse(
                {"error": "Task status must be [not-done, semi-done, or done]"}, status=400
            )

        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        try:
            task = Task.objects.get(id=task_id, board=board)
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)

        task.status = status
        task.save()

        # Prepare assigned_to data
        assigned_to_data = None
        if task.assigned_to:
            assigned_to_data = {
                "id": task.assigned_to.id,
                "username": task.assigned_to.username,
                "email": task.assigned_to.email,
                "first_name": task.assigned_to.first_name,
                "last_name": task.assigned_to.last_name,
            }

        return JsonResponse(
            {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "assigned_to": assigned_to_data,
                "board": {
                    "id": task.board.id,
                    "name": task.board.name,
                    "workspace": {
                        "id": task.board.workspace.id,
                        "name": task.board.workspace.name,
                        "created_at": task.board.workspace.created_at,
                        "updated_at": task.board.workspace.updated_at,
                    },
                    "created_at": task.board.created_at,
                    "updated_at": task.board.updated_at,
                },
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }
        )

    return JsonResponse({"error": "Method not allowed"}, status=405)


# Assign/unassign user to task
@csrf_exempt
def assign_user_to_task(request, board_id, task_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            assigned_to_id = data.get("assigned_to_id")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        # Check if the board exists
        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return JsonResponse({"error": "Board not found"}, status=404)

        # Check if the task exists
        try:
            task = Task.objects.get(id=task_id, board=board)
        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)

        # Handle assignment/unassignment
        if assigned_to_id is None or assigned_to_id == "":
            # Unassign user
            task.assigned_to = None
        else:
            # Assign user
            try:
                assigned_to = User.objects.get(id=assigned_to_id)
                task.assigned_to = assigned_to
            except User.DoesNotExist:
                return JsonResponse({"error": "Assigned user not found"}, status=404)

        task.save()

        # Prepare assigned_to data
        assigned_to_data = None
        if task.assigned_to:
            assigned_to_data = {
                "id": task.assigned_to.id,
                "username": task.assigned_to.username,
                "email": task.assigned_to.email,
                "first_name": task.assigned_to.first_name,
                "last_name": task.assigned_to.last_name,
            }

        return JsonResponse(
            {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "assigned_to": assigned_to_data,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }
        )

    return JsonResponse({"error": "Method not allowed"}, status=405)