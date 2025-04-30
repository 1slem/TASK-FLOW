from django.db import models
from workspace.models import Workspace

# Create your models here.

class Board(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='boards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name