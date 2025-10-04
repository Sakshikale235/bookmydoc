# from django.contrib import admin
# from django.urls import path, include
# from home import views  # Import views from the home app

# urlpatterns = [
#     path('', views.index, name="home"),    # Assuming you have an index view in home/views.py
#     path('login', views.login, name="login"),  # Assuming you have a login view in home/views.py
#     # path('register', views.register, name="register"),  # Assuming you have a register view in home/views.py
#     path('logout', views.logoutuser, name="logout"),  # Assuming you have a logout view in home/views.py
# ]


from django.urls import path
from home import views

urlpatterns = [
    path('', views.dashboard, name="home"),
    path('auth/', views.auth_page, name="auth_page"),          # Renders login/register UI
    path('login/', views.login_user, name="login"),           # Handles login POST
    path('register/', views.register_user, name="register"), # Handles register POST
    path('logout/', views.logout_user, name="logout"),
]
