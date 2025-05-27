from django.db import models
from board.models import Board
from django.contrib.auth.models import User

class Task(models.Model):
    STATUS_CHOICES = [
        ("not-done", "Not Done"),
        ("semi-done", "Semi Done"),
        ("done", "Done"),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]
    priority = models.CharField(max_length=6, choices=PRIORITY_CHOICES, default="low")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="not-done")
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tasks"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
