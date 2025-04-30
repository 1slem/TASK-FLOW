# workspace/serializers.py

from rest_framework import serializers
from .models import Workspace, UserWorkspace
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'created_at', 'updated_at']


class UserWorkspaceSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    workspace = WorkspaceSerializer()

    class Meta:
        model = UserWorkspace
        fields = ['id', 'user', 'workspace', 'role', 'join_date']

class UserWorkspaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWorkspace
        fields = ['user', 'workspace', 'role']

