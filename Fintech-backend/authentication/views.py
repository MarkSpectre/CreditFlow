from django.shortcuts import render

# Create your views here.
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.contrib.auth.models import User
# from rest_framework_simplejwt.tokens import RefreshToken
# from google.auth.transport import requests
# from google.oauth2 import id_token

# class GoogleSignInView(APIView):
#     def post(self, request):
#         token = request.data.get('token')
#         try:
#             # Verify the token payload signature directly with Google
#             idinfo = id_token.verify_oauth2_token(token, requests.Request(), "652870265223-lm8eemfdcg6l0t7ocoee91rknpjo051j.apps.googleusercontent.com")
            
#             email = idinfo['email']
#             first_name = idinfo.get('given_name', '')
#             last_name = idinfo.get('family_name', '')
            
#             # Retrieve or create user in Supabase SQL DB via Django ORM mapping
#             user, created = User.objects.get_or_create(username=email, defaults={
#                 'email': email,
#                 'first_name': first_name,
#                 'last_name': last_name
#             })
            
#             # Generate local system session tokens
#             refresh = RefreshToken.for_user(user)
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'email': user.email
#             }, status=status.HTTP_200_OK)
            
#         except ValueError:
#             return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)

import logging
import requests as http_requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests
from google.oauth2 import id_token
from .models import Profile

# Initialize logger
logger = logging.getLogger(__name__)

from analytics.models import BusinessProfile

class GoogleSignInView(APIView):
    def post(self, request):
        logger.info("Received Google login request")
        access_token = request.data.get('token')
        role = request.data.get('role', 'business_owner')

        if not access_token:
            logger.warning("Login attempt failed: No token provided in payload")
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Fetch user profile from Google
        logger.info("Verifying access token with Google API...")
        google_response = http_requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if google_response.status_code != 200:
            logger.error(f"Google token verification failed with status: {google_response.status_code}")
            return Response({'error': 'Failed to verify token with Google'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = google_response.json()
        email = user_info.get('email')
        picture_url = user_info.get('picture', '')

        logger.info(f"Google Token verified for user: {email}")

        # 2. Get or create User in Supabase
        user, created = User.objects.get_or_create(username=email, defaults={
            'email': email,
            'first_name': user_info.get('given_name', ''),
            'last_name': user_info.get('family_name', '')
        })

        if created:
            logger.info(f"Created new User record in auth_user table for: {email}")
        else:
            logger.info(f"Retrieved existing User record for: {email}")

        # 3. Save or Update Profile
        profile, p_created = Profile.objects.get_or_create(user=user)
        profile.role = role
        if picture_url:
            profile.picture = picture_url
        profile.save()

        # 4. Get BusinessProfile to check onboarding status
        bus_profile, _ = BusinessProfile.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)
        logger.info("JWT session tokens successfully generated")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name or email.split('@')[0].capitalize(),
                'last_name': user.last_name or '',
                'role': profile.role,
                'onboarding_completed': bus_profile.onboarding_completed,
                'picture': profile.picture
            }
        }, status=status.HTTP_200_OK)


class StandardLoginView(APIView):
    """View to handle username/email standard authentication and create DB user profile"""
    def post(self, request):
        username_raw = request.data.get('username') or request.data.get('email') or 'User'
        password = request.data.get('password') or 'password'
        role = request.data.get('role', 'business_owner')
        
        email = username_raw if '@' in username_raw else f"{username_raw}@trustledger.com"
        first_name = username_raw.split('@')[0].capitalize()
        
        user, created = User.objects.get_or_create(username=email, defaults={
            'email': email,
            'first_name': first_name,
            'last_name': ''
        })
        
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()

        bus_profile, _ = BusinessProfile.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name or first_name,
                'last_name': user.last_name or '',
                'role': profile.role,
                'onboarding_completed': bus_profile.onboarding_completed,
                'picture': profile.picture
            }
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """Endpoint to fetch logged-in user profile from database"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        bus_profile, _ = BusinessProfile.objects.get_or_create(user=user)
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': profile.role,
                'onboarding_completed': bus_profile.onboarding_completed,
                'picture': profile.picture
            }
        }, status=status.HTTP_200_OK)