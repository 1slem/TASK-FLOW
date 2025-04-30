from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name")
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        required_fields = ["username", "email", "password", "first_name", "last_name"]
        missing_fields = [
            field for field in required_fields if field not in validated_data
        ]

        if missing_fields:
            raise serializers.ValidationError(
                f"The following fields are required: {', '.join(missing_fields)}"
            )

        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        required_fields = ["username", "password"]
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            raise serializers.ValidationError(
                f"The following fields are required: {', '.join(missing_fields)}"
            )

        # Authenticate the user
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid username or password")
        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive")

        return user
