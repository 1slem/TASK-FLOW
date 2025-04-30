from django.views import View
from django.shortcuts import render

class HomeView(View):
    def get(self, request):
        return render(request, 'template/pages/home/home.html')  # ✅ correct if folder is 'page'

