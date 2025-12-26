from django.urls import path
from .views import analyze_symptoms, recommend_doctor

urlpatterns = [
    path("analyze-symptoms/", analyze_symptoms, name="analyze_symptoms"),
    path("recommend-doctor/", recommend_doctor, name="recommend_doctor"),
]
