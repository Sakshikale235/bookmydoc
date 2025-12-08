# backend/api/serializers.py
from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "role", "text", "meta", "created_at"]
        read_only_fields = ["id", "created_at"]

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "auth_id", "created_at", "updated_at", "metadata"]
        read_only_fields = ["id", "created_at", "updated_at"]
