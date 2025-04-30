from django.urls import path
from .views import get_boards, get_board_by_id, create_board, update_board, delete_board

urlpatterns = [
    path('all/<int:workspace_id>', get_boards, name='get_boards'),
    path('<int:board_id>', get_board_by_id, name='get_board_by_id'),
    path('create', create_board, name='create_board'),
    path('update/<int:board_id>', update_board, name='update_board'),
    path('delete/<int:board_id>', delete_board, name='delete_board')
]