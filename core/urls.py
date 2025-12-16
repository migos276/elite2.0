from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'matching/questions', views.MatchingQuestionViewSet, basename='matching-questions')
router.register(r'profiles', views.ProfileViewSet, basename='profiles')
router.register(r'courses', views.CoursePackViewSet, basename='courses')
router.register(r'faqs', views.FAQViewSet, basename='faqs')
router.register(r'jobs', views.JobOfferViewSet, basename='jobs')
router.register(r'competitions', views.CompetitionViewSet, basename='competitions')
router.register(r'rewards', views.ReferralRewardViewSet, basename='rewards')
router.register(r'messages', views.ChatMessageViewSet, basename='messages')


urlpatterns = [
    # Test endpoint for debugging
    path('test/', views.test_connection, name='test-connection'),
    
    # Authentication
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Matching
    path('matching/submit/', views.submit_matching_form, name='submit-matching'),
    path('matching/select-profile/', views.select_profile, name='select-profile'),
    
    # Adaptive Path
    path('path/get/', views.get_adaptive_path, name='get-adaptive-path'),
    path('path/validate/', views.validate_path, name='validate-path'),
    
    # Courses
    path('courses/my-courses/', views.get_user_courses, name='my-courses'),
    path('chapters/<int:chapter_id>/progress/', views.get_chapter_progress, name='chapter-progress'),
    path('chapters/<int:chapter_id>/quiz/', views.get_quiz, name='get-quiz'),
    path('chapters/<int:chapter_id>/quiz/submit/', views.submit_quiz, name='submit-quiz'),
    path('chapters/<int:chapter_id>/referral-bypass/', views.use_referral_bypass, name='referral-bypass'),
    
    # Physical Centers
    path('centers/', views.get_physical_centers, name='physical-centers'),
    
    # FAQ AI
    path('faq/ask/', views.ask_ai_faq, name='ask-ai-faq'),
    
    # Referrals
    path('referrals/stats/', views.get_referral_stats, name='referral-stats'),

    # Users
    path('users/search/', views.search_users, name='search-users'),

    # Router URLs
    path('', include(router.urls)),
]
