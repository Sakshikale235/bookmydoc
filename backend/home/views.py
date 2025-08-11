from django.shortcuts import render, redirect
from django.contrib.auth.models import User 
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

def dashboard(request):
    if request.user.is_anonymous:
        return redirect('/auth')
    return render(request, 'dashboard.html')

def auth_page(request):
    # Show login panel by default, or register if ?register=1 in query
    register = request.GET.get('register') == '1'
    return render(request, 'auth.html', {'register': register})

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email    = request.POST.get('email')
        password = request.POST.get('password')
        confirm  = request.POST.get('confirm_password')

        if password != confirm:
            return render(request, 'auth.html', {'error': 'Passwords do not match', 'register': True})
        
        if User.objects.filter(username=username).exists():
            return render(request, 'auth.html', {'error': 'Username already exists', 'register': True})

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return render(request, 'auth.html', {'success': 'Registration successful! Please login.'})

    # If someone GETs /register, redirect to /auth with register panel open
    return redirect('/auth?register=1')

def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return redirect('/')
        else:
            return render(request, 'auth.html', {'error': 'Invalid credentials'})

    # If someone GETs /login, redirect to /auth
    return redirect('/auth')

def logoutuser(request):
    auth_logout(request)
    return redirect('/auth')