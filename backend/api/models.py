# backend/api/models.py
from django.db import models
from django.db.models import JSONField
import uuid

class Conversation(models.Model):
    """
    Stores a conversation / chat session.
    If user is authenticated, store auth_id; else null for anonymous sessions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auth_id = models.CharField(max_length=255, null=True, blank=True)
    conversation_stage = models.CharField(max_length=50, default="symptom_intake")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = JSONField(default=dict, blank=True)
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # auth_id = models.CharField(max_length=255, null=True, blank=True)  # Supabase auth id or Django user id
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
    # metadata = JSONField(default=dict, blank=True)  # free-form (device, locale, source, etc.)

    def __str__(self):
        return str(self.id)

class Message(models.Model):
    """
    Each message in a conversation. role: "user" | "ai" | "system"
    meta: optional JSON (doctor suggestion, analysis result, etc.)
    """
    id = models.BigAutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=20)  # "user", "ai", "system"
    text = models.TextField()
    meta = JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # optional: store vector id or summary pointer in future

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.text[:60]}"
