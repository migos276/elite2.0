from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'academic_level', 'has_completed_matching', 'referral_points', 'referred_by']
    list_filter = ['academic_level', 'has_completed_matching', 'is_staff']
    search_fields = ['username', 'email', 'referral_code']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations Elite', {
            'fields': ('phone', 'city', 'academic_level', 'referral_code', 'referred_by', 
                      'referral_points', 'has_completed_matching', 'selected_profile')
        }),
    )


class MatchingAnswerInline(admin.TabularInline):
    model = MatchingAnswer
    extra = 4


@admin.register(MatchingQuestion)
class MatchingQuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'order', 'is_active']
    list_filter = ['is_active']
    inlines = [MatchingAnswerInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name']


@admin.register(AdaptivePath)
class AdaptivePathAdmin(admin.ModelAdmin):
    list_display = ['profile', 'academic_level', 'duration_months']
    list_filter = ['academic_level']
    search_fields = ['profile__name']


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    show_change_link = True


@admin.register(CoursePack)
class CoursePackAdmin(admin.ModelAdmin):
    list_display = ['title', 'domain', 'price', 'profile', 'is_active']
    list_filter = ['domain', 'is_active', 'profile']
    search_fields = ['title']
    inlines = [ChapterInline]


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 5
    show_change_link = True


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'course_pack', 'order']
    list_filter = ['course_pack']
    search_fields = ['title']


class QuizChoiceInline(admin.TabularInline):
    model = QuizChoice
    extra = 4


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'text', 'order', 'points']
    inlines = [QuizChoiceInline]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['chapter', 'passing_score']
    inlines = [QuizQuestionInline]


@admin.register(UserCoursePurchase)
class UserCoursePurchaseAdmin(admin.ModelAdmin):
    list_display = ['user', 'course_pack', 'amount_paid', 'purchased_at']
    list_filter = ['purchased_at']
    search_fields = ['user__username', 'course_pack__title']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'score', 'passed', 'referral_option_used', 'attempted_at']
    list_filter = ['passed', 'referral_option_used', 'attempted_at']
    search_fields = ['user__username']


@admin.register(ChapterProgress)
class ChapterProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'chapter', 'status', 'last_accessed']
    list_filter = ['status']
    search_fields = ['user__username', 'chapter__title']


@admin.register(PhysicalCenter)
class PhysicalCenterAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'phone', 'is_active']
    list_filter = ['city', 'is_active']
    search_fields = ['name', 'city']


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order']


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'order', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['question']


@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'posted_date', 'expiry_date', 'is_active']
    list_filter = ['is_active', 'posted_date', 'location']
    search_fields = ['title', 'company']


@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'registration_deadline', 'exam_date', 'is_active']
    list_filter = ['is_active', 'registration_deadline']
    search_fields = ['title', 'organizer']


@admin.register(ReferralReward)
class ReferralRewardAdmin(admin.ModelAdmin):
    list_display = ['name', 'reward_type', 'points_required', 'is_active']
    list_filter = ['reward_type', 'is_active']


@admin.register(ReferralRedemption)
class ReferralRedemptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'reward', 'points_spent', 'redeemed_at']
    list_filter = ['redeemed_at']
    search_fields = ['user__username']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'message', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'recipient__username']
