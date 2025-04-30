from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Workspace(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserWorkspace(models.Model):

    ROLE_CHOICES = [
        ("OWNER", "Owner"),
        ("MEMBER", "Member"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    join_date = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="OWNER")

    class Meta:
        unique_together = ("user", "workspace")

    def __str__(self):
        return f"{self.user.username} - {self.workspace.name} - {self.role}"

    def __str__(self):
        return f"{self.user.username} - {self.workspace.name}"
    
    
Workspace.users = models.ManyToManyField(User, through=UserWorkspace, related_name='workspaces')
