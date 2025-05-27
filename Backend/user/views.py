from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .serializers import UserSerializer, LoginSerializer
from django.contrib.auth.models import User
import json
import jwt, datetime


# Create your views here.
@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            serializer = UserSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                user = User.objects.get(username=data["username"])
                print(user)
                return JsonResponse(serializer.data, status=201)
            return JsonResponse(serializer.errors, status=422)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": e}, status=400)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            serializer = LoginSerializer(data=data)
            if serializer.is_valid():
                user = serializer.validated_data

                payload = {
                    "id": user.id,
                    "email": user.email,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
                    "iat": datetime.datetime.utcnow(),
                }

                token = jwt.encode(
                    payload, "eY18N^G5uJ4#TpRZQc3!X*w9m7$L@KbS", algorithm="HS256"
                )

                return JsonResponse({
                    "token": token,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name
                    }
                }, status=200)
            return JsonResponse(serializer.errors, status=401)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": e}, status=400)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def me(request):
    if request.method == "GET":
        try:
            payload = request.user
            user_id = payload.get("id")

            if not user_id:
                return JsonResponse({"error": "User ID not found in token"}, status=400)

            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return JsonResponse(serializer.data, status=200)

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": e}, status=400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


# Logout View
@csrf_exempt
def logout(request):
    if request.method == "POST":
        # Simulating the logout by instructing the client to delete the token on the client side.
        return JsonResponse({"message": "Logged out successfully. Please discard your token."}, status=200)

    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)



