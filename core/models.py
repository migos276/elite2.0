from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    """Utilisateur personnalisé avec champs additionnels"""
    LEVEL_CHOICES = [
        ('BEPC', 'BEPC'),
        ('BAC', 'BAC'),
        ('LICENCE', 'Licence'),
    ]
    
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    academic_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, blank=True)
    referral_code = models.CharField(max_length=12, unique=True, blank=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    referral_points = models.IntegerField(default=0)
    has_completed_matching = models.BooleanField(default=False)
    selected_profile = models.ForeignKey('Profile', on_delete=models.SET_NULL, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4())[:12].upper()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.username


class MatchingQuestion(models.Model):
    """Questions du formulaire de correspondance"""
    text = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Question {self.order}: {self.text[:50]}"


class MatchingAnswer(models.Model):
    """Réponses possibles aux questions de correspondance"""
    question = models.ForeignKey(MatchingQuestion, on_delete=models.CASCADE, related_name='answers')
    text = models.TextField()
    profile_weights = models.JSONField(default=dict, help_text="Poids pour chaque profil {'profile_id': score}")
    
    def __str__(self):
        return f"{self.question} - {self.text[:50]}"


class UserMatchingResponse(models.Model):
    """Réponses d'un utilisateur au formulaire"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matching_responses')
    question = models.ForeignKey(MatchingQuestion, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(MatchingAnswer, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'question']


class Profile(models.Model):
    """Profils professionnels disponibles"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    icon = models.ImageField(upload_to='profiles/', blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class AdaptivePath(models.Model):
    """Parcours adaptatif par profil et niveau"""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='paths')
    academic_level = models.CharField(max_length=20, choices=User.LEVEL_CHOICES)
    steps = models.JSONField(help_text="Liste des étapes du parcours")
    duration_months = models.IntegerField(help_text="Durée estimée en mois")
    
    class Meta:
        unique_together = ['profile', 'academic_level']
    
    def __str__(self):
        return f"{self.profile.name} - {self.academic_level}"


class UserPathValidation(models.Model):
    """Validation du parcours par l'utilisateur"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='path_validation')
    adaptive_path = models.ForeignKey(AdaptivePath, on_delete=models.CASCADE)
    validated_at = models.DateTimeField(auto_now_add=True)
    is_started = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)


class CoursePack(models.Model):
    """Packs de cours payants par domaine"""
    title = models.CharField(max_length=200)
    domain = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    thumbnail = models.ImageField(upload_to='course_packs/', blank=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='course_packs')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class Chapter(models.Model):
    """Chapitres d'un pack de cours"""
    course_pack = models.ForeignKey(CoursePack, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    content_text = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['course_pack', 'order']
    
    def __str__(self):
        return f"{self.course_pack.title} - Chapitre {self.order}: {self.title}"


class Quiz(models.Model):
    """Quiz à la fin de chaque chapitre"""
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='quiz')
    passing_score = models.IntegerField(default=14, validators=[MinValueValidator(0), MaxValueValidator(20)])
    
    def __str__(self):
        return f"Quiz - {self.chapter.title}"


class QuizQuestion(models.Model):
    """Questions d'un quiz"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.quiz} - Question {self.order}"


class QuizChoice(models.Model):
    """Choix de réponse pour une question"""
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='choices')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.question} - {self.text[:50]}"


class UserCoursePurchase(models.Model):
    """Achats de packs de cours par les utilisateurs"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    course_pack = models.ForeignKey(CoursePack, on_delete=models.CASCADE)
    purchased_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=50)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        unique_together = ['user', 'course_pack']
    
    def __str__(self):
        return f"{self.user.username} - {self.course_pack.title}"


class ChapterProgress(models.Model):
    """Progression de l'utilisateur dans un chapitre"""
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'En cours'),
        ('COMPLETED', 'Terminé'),
        ('LOCKED', 'Verrouillé'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chapter_progress')
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='LOCKED')
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'chapter']


class QuizAttempt(models.Model):
    """Tentatives de quiz par l'utilisateur"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(20)])
    passed = models.BooleanField(default=False)
    can_retake = models.BooleanField(default=False)
    referral_option_used = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-attempted_at']


class PhysicalCenter(models.Model):
    """Centres physiques par ville pour diplômes"""
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.city}"


class FAQCategory(models.Model):
    """Catégories de FAQ"""
    name = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = "FAQ Categories"
    
    def __str__(self):
        return self.name


class FAQ(models.Model):
    """Questions fréquemment posées"""
    category = models.ForeignKey(FAQCategory, on_delete=models.CASCADE, related_name='faqs')
    question = models.TextField()
    answer = models.TextField()
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"
    
    def __str__(self):
        return self.question


class JobOffer(models.Model):
    """Offres d'emploi"""
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField()
    salary_range = models.CharField(max_length=100, blank=True)
    application_url = models.URLField()
    posted_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-posted_date']
    
    def __str__(self):
        return f"{self.title} - {self.company}"


class Competition(models.Model):
    """Concours disponibles"""
    title = models.CharField(max_length=200)
    organizer = models.CharField(max_length=200)
    description = models.TextField()
    eligibility = models.TextField()
    registration_url = models.URLField()
    registration_deadline = models.DateField()
    exam_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-registration_deadline']
    
    def __str__(self):
        return self.title


class ReferralReward(models.Model):
    """Récompenses du système de parrainage"""
    REWARD_TYPE_CHOICES = [
        ('COURSE_PACK', 'Pack de cours gratuit'),
        ('SCHOLARSHIP', 'Bourse'),
    ]
    
    name = models.CharField(max_length=200)
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPE_CHOICES)
    points_required = models.IntegerField()
    course_pack = models.ForeignKey(CoursePack, on_delete=models.CASCADE, null=True, blank=True)
    scholarship_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.points_required} points)"


class ReferralRedemption(models.Model):
    """Historique d'échange de points"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(ReferralReward, on_delete=models.CASCADE)
    points_spent = models.IntegerField()
    redeemed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.reward.name}"


class ChatMessage(models.Model):
    """Messages du chat entre utilisateurs"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username}"
