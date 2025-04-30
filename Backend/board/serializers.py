from rest_framework import serializers
from .models import Board
from workspace.serializers import WorkspaceSerializer
from task.serializers import TaskSerializer  # assuming tasks are serialized here

class BoardSerializer(serializers.ModelSerializer):
    workspace = WorkspaceSerializer(read_only=True)
    workspace_id = serializers.PrimaryKeyRelatedField(
        queryset=Board.objects.all(), source='workspace', write_only=True
    )
    tasks = TaskSerializer(many=True, read_only=True)  # if you have a related_name='tasks' in Task model

    class Meta:
        model = Board
        fields = [
            'id',
            'name',
            'workspace',
            'workspace_id',
            'tasks',
            'created_at',
            'updated_at'
        ]
