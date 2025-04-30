# urls.py
from django.urls import path
from .views import HomeView  # import the HomeView class

urlpatterns = [
    path('home/', HomeView.as_view(), name='home'),  # Ensure this name matches the redirect
    # other paths...
]
