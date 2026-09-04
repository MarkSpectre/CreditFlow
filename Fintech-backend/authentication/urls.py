from django.urls import path
from .views import GoogleSignInView, StandardLoginView, UserProfileView


urlpatterns = [
    path('auth/google/', GoogleSignInView.as_view(), name='google_signin'),
    path('auth/login/', StandardLoginView.as_view(), name='standard_login'),
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),
]