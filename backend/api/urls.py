from django.urls import path
from .views import analyze_symptoms
from . import views

urlpatterns = [
    path("analyze-symptoms/", analyze_symptoms, name="analyze_symptoms"),
    path("chat/create/", views.create_conversation, name="create_conversation"),
    path("chat/messages/", views.append_message, name="append_message"),
    path("chat/<uuid:convo_id>/history/", views.conversation_history, name="conversation_history"),
]
