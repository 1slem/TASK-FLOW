import jwt
from django.http import JsonResponse
from django.urls import resolve

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.exempt_urls = [
            "login",
            "register",
        ]

    def __call__(self, request):
        # Skip admin path
        if request.path.startswith("/admin/"):
            return self.get_response(request)

        # Safely get the current URL name
        try:
            current_url_name = resolve(request.path_info).url_name
        except:
            current_url_name = None

        if current_url_name in self.exempt_urls:
            return self.get_response(request)

        if "Authorization" not in request.headers:
            return JsonResponse({"error": "Token not found"}, status=400)

        try:
            token = request.headers["Authorization"].split(" ")[1]
            request.user = jwt.decode(
                token, "eY18N^G5uJ4#TpRZQc3!X*w9m7$L@KbS", algorithms=["HS256"]
            )
        except IndexError:
            return JsonResponse({"error": "Invalid authorization header"}, status=400)
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=400)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=400)

        return self.get_response(request)
