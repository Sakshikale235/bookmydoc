# from django.urls import path
# from home import views

# urlpatterns = [
#     path('', views.dashboard, name="home"),
#     path('auth', views.auth_page, name="auth_page"),  # Only this renders the login/register UI
#     path('login', views.login, name="login"),         # Only POSTs come here
#     path('register', views.register, name="register"),# Only POSTs come here
#     path('logout', views.logoutuser, name="logout"),
# ]

from django.urls import path
from home import views

urlpatterns = [
    # Main pages
    path('', views.dashboard, name="home"),   # Root homepage
    path('symptom-checker/', views.symptom_checker, name="symptom_checker"),
    path('find-doc/', views.find_doc, name="find_doc"),
    path('treatment/', views.treatment, name="treatment"),
    path('dashboard/', views.dashboard, name="dashboard"),

    # Auth routes
    path('auth/', views.auth_page, name="auth_page"),     # Renders login/register UI
    path('login/', views.login, name="login"),            # POST login
    path('register/', views.register, name="register"),   # POST register
    path('logout/', views.logoutuser, name="logout"),     # Logout
]
