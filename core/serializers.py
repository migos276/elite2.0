from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    referral_code_used = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                  'phone', 'city', 'academic_level', 'referral_code_used']
    
    def validate_username(self, value):
        """Validation du nom d'utilisateur"""
        if not value:
            raise serializers.ValidationError("Le nom d'utilisateur est requis")
        
        if len(value) < 3:
            raise serializers.ValidationError("Le nom d'utilisateur doit contenir au moins 3 caractères")
        
        # Vérifier que le nom d'utilisateur n'existe pas déjà
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris")
        
        return value
    
    def validate_email(self, value):
        """Validation de l'email"""
        if not value:
            raise serializers.ValidationError("L'email est requis")
        
        # Vérifier le format de l'email
        if '@' not in value or '.' not in value:
            raise serializers.ValidationError("Format d'email invalide")
        
        # Vérifier que l'email n'existe pas déjà
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà")
        
        return value.lower().strip()
    
    def validate_password(self, value):
        """Validation du mot de passe"""
        if not value:
            raise serializers.ValidationError("Le mot de passe est requis")
        
        if len(value) < 8:
            raise serializers.ValidationError("Le mot de passe doit contenir au moins 8 caractères")
        
        return value
    
    def validate_phone(self, value):
        """Validation du téléphone (optionnel)"""
        if value:
            # Supprimer les espaces et caractères spéciaux pour validation
            clean_phone = ''.join(c for c in value if c.isdigit() or c in '+-() ')
            if len(clean_phone) < 8:
                raise serializers.ValidationError("Format de téléphone invalide")
        
        return value
    
    def validate_city(self, value):
        """Validation de la ville"""
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("Le nom de la ville doit contenir au moins 2 caractères")
        return value.strip() if value else ""
    
    def validate_referral_code_used(self, value):
        """Validation du code de parrainage"""
        if value:
            value = value.strip().upper()
            if not User.objects.filter(referral_code=value).exists():
                raise serializers.ValidationError("Code de parrainage invalide")
        return value
    
    def create(self, validated_data):
        referral_code = validated_data.pop('referral_code_used', None)
        
        # Créer l'utilisateur
        user = User.objects.create_user(**validated_data)
        
        # Gérer le parrainage si code fourni
        if referral_code:
            try:
                referrer = User.objects.get(referral_code=referral_code.upper())
                user.referred_by = referrer
                referrer.referral_points += 1
                referrer.save()
                user.save()
            except User.DoesNotExist:
                # En cas d'erreur, on continue sans parrainage
                pass
        
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                  'city', 'academic_level', 'referral_code', 'referral_points', 
                  'has_completed_matching', 'selected_profile']
        read_only_fields = ['referral_code', 'referral_points', 'has_completed_matching']


class MatchingAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingAnswer
        fields = ['id', 'text']


class MatchingQuestionSerializer(serializers.ModelSerializer):
    answers = MatchingAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = MatchingQuestion
        fields = ['id', 'text', 'order', 'answers']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'name', 'description', 'category', 'icon']


class AdaptivePathSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = AdaptivePath
        fields = ['id', 'profile', 'academic_level', 'steps', 'duration_months']


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'content_text', 'video_url']


class CoursePackSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    is_purchased = serializers.SerializerMethodField()
    
    class Meta:
        model = CoursePack
        fields = ['id', 'title', 'domain', 'description', 'price', 'thumbnail', 
                  'profile', 'chapters', 'is_purchased']
    
    def get_is_purchased(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return UserCoursePurchase.objects.filter(user=user, course_pack=obj).exists()
        return False


class QuizChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizChoice
        fields = ['id', 'text']


class QuizQuestionSerializer(serializers.ModelSerializer):
    choices = QuizChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'text', 'order', 'points', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'chapter', 'passing_score', 'questions']


class QuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.IntegerField())


class ChapterProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterProgress
        fields = ['id', 'chapter', 'status', 'last_accessed']


class PhysicalCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalCenter
        fields = ['id', 'name', 'city', 'address', 'phone', 'email']


class FAQSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = FAQ
        fields = ['id', 'category', 'category_name', 'question', 'answer']


class JobOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOffer
        fields = ['id', 'title', 'company', 'location', 'description', 'requirements', 
                  'salary_range', 'application_url', 'posted_date', 'expiry_date']


class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = ['id', 'title', 'organizer', 'description', 'eligibility', 
                  'registration_url', 'registration_deadline', 'exam_date']


class ReferralRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralReward
        fields = ['id', 'name', 'reward_type', 'points_required', 'course_pack', 'scholarship_amount']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'recipient', 'recipient_name', 
                  'message', 'is_read', 'created_at']
        read_only_fields = ['sender']
