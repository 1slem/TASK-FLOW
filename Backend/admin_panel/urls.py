from django.urls import path
from .admin import admin_site
from .views import admin_dashboard

# Custom admin URLs
urlpatterns = [
    path('dashboard/', admin_dashboard, name='admin_dashboard'),
    path('', admin_site.urls),
]
