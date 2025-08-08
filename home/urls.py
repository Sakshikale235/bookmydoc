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
    path('', views.index, name="home"),
    path('auth', views.auth_page, name="auth_page"),  # Only this renders the login/register UI
    path('login', views.login, name="login"),         # Only POSTs come here
    path('register', views.register, name="register"),# Only POSTs come here
    path('logout', views.logoutuser, name="logout"),
]