from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.conf import settings
from django.utils import timezone
from collections import defaultdict
import openai

from .models import *
from .serializers import *

User = get_user_model()

# ENDPOINT DE TEST POUR DIAGNOSTIC
@api_view(['GET'])
@permission_classes([AllowAny])
def test_connection(request):
    """Endpoint de test pour vérifier la connectivité"""
    return Response({
        'status': 'OK',
        'message': 'API Elite 2.0 fonctionne correctement',
        'version': '1.0',
        'timestamp': timezone.now().isoformat()
    })

class UserRegistrationView(generics.CreateAPIView):
    """Inscription utilisateur avec code de parrainage optionnel"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Profil utilisateur"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class MatchingQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """Questions du formulaire de correspondance"""
    queryset = MatchingQuestion.objects.filter(is_active=True)
    serializer_class = MatchingQuestionSerializer
    permission_classes = [IsAuthenticated]



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_matching_form(request):
    """Soumission du formulaire de correspondance avec algorithme de matching"""
    user = request.user
    responses = request.data.get('responses', [])
    
    # Valider les données d'entrée
    if not responses:
        return Response({'error': 'Aucune réponse fournie'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Enregistrer les réponses
    for response_data in responses:
        question_id = response_data.get('question_id')
        answer_id = response_data.get('answer_id')
        
        if not question_id or not answer_id:
            return Response({'error': 'Données de réponse incomplètes'}, status=status.HTTP_400_BAD_REQUEST)
        

        try:
            # Vérifier que la réponse existe avant de l'utiliser
            answer = MatchingAnswer.objects.get(id=answer_id, question_id=question_id)
            
            UserMatchingResponse.objects.update_or_create(
                user=user,
                question_id=question_id,
                defaults={'selected_answer_id': answer_id}
            )
        except MatchingAnswer.DoesNotExist:
            return Response({'error': 'Réponse ou question invalide'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Erreur lors de l\'enregistrement: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Algorithme de matching
    profile_scores = defaultdict(int)
    user_responses = UserMatchingResponse.objects.filter(user=user).select_related('selected_answer')
    
    for response in user_responses:
        weights = response.selected_answer.profile_weights
        
        # S'assurer que weights est un dictionnaire
        if isinstance(weights, str):
            try:
                import json
                weights = json.loads(weights)
            except json.JSONDecodeError:
                weights = {}
        
        if not isinstance(weights, dict):
            weights = {}
        
        for profile_id, score in weights.items():
            try:
                profile_scores[int(profile_id)] += int(score)
            except (ValueError, TypeError):
                # Ignorer les scores invalides
                continue
    
    # Trier les profils par score
    sorted_profiles = sorted(profile_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Obtenir les 3 meilleurs profils
    recommended_profile_ids = [p[0] for p in sorted_profiles[:3]]
    recommended_profiles = Profile.objects.filter(id__in=recommended_profile_ids)
    
    serializer = ProfileSerializer(recommended_profiles, many=True)
    
    return Response({
        'recommended_profiles': serializer.data,
        'message': 'Choisissez un profil parmi les recommandations'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def select_profile(request):
    """Sélection du profil par l'utilisateur"""
    user = request.user
    profile_id = request.data.get('profile_id')
    
    try:
        profile = Profile.objects.get(id=profile_id)
        user.selected_profile = profile
        user.has_completed_matching = True
        user.save()
        
        return Response({
            'message': 'Profil sélectionné avec succès',
            'profile': ProfileSerializer(profile).data
        })
    except Profile.DoesNotExist:
        return Response({'error': 'Profil non trouvé'}, status=status.HTTP_404_NOT_FOUND)


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste tous les profils pour sélection manuelle"""
    queryset = Profile.objects.filter(is_active=True)
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_adaptive_path(request):
    """Récupérer le parcours adaptatif pour l'utilisateur"""
    user = request.user
    
    if not user.selected_profile:
        return Response({'error': 'Aucun profil sélectionné'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        adaptive_path = AdaptivePath.objects.get(
            profile=user.selected_profile,
            academic_level=user.academic_level
        )
        serializer = AdaptivePathSerializer(adaptive_path)
        return Response(serializer.data)
    except AdaptivePath.DoesNotExist:
        return Response({'error': 'Aucun parcours disponible pour ce profil et niveau'}, 
                        status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_path(request):
    """Validation du parcours par l'utilisateur"""
    user = request.user
    path_id = request.data.get('path_id')
    
    try:
        adaptive_path = AdaptivePath.objects.get(id=path_id)
        validation, created = UserPathValidation.objects.update_or_create(
            user=user,
            defaults={
                'adaptive_path': adaptive_path,
                'is_started': True,
                'started_at': timezone.now()
            }
        )
        
        return Response({'message': 'Parcours validé et démarré avec succès'})
    except AdaptivePath.DoesNotExist:
        return Response({'error': 'Parcours non trouvé'}, status=status.HTTP_404_NOT_FOUND)


class CoursePackViewSet(viewsets.ReadOnlyModelViewSet):
    """Packs de cours par domaine"""
    queryset = CoursePack.objects.filter(is_active=True)
    serializer_class = CoursePackSerializer
    permission_classes = [IsAuthenticated]
    

    @action(detail=True, methods=['post'])
    def purchase(self, request, pk=None):
        """Achat d'un pack de cours avec création automatique de toutes les progressions"""
        course_pack = self.get_object()
        user = request.user
        payment_method = request.data.get('payment_method')
        
        # Vérifier si déjà acheté
        if UserCoursePurchase.objects.filter(user=user, course_pack=course_pack).exists():
            return Response({'error': 'Pack déjà acheté'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer l'achat
        purchase = UserCoursePurchase.objects.create(
            user=user,
            course_pack=course_pack,
            payment_method=payment_method,
            amount_paid=course_pack.price
        )
        
        # Créer toutes les progressions pour ce pack de cours
        chapters = course_pack.chapters.all().order_by('order')
        created_progress = 0
        
        for index, chapter in enumerate(chapters):
            # Premier chapitre = EN_COURS, les autres = LOCKED
            status = 'IN_PROGRESS' if index == 0 else 'LOCKED'
            
            ChapterProgress.objects.get_or_create(
                user=user,
                chapter=chapter,
                defaults={'status': status}
            )
            created_progress += 1
        
        return Response({
            'message': 'Achat réussi', 
            'purchase_id': purchase.id,
            'chapters_unlocked': created_progress
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_courses(request):
    """Récupérer les cours achetés par l'utilisateur"""
    user = request.user
    purchases = UserCoursePurchase.objects.filter(user=user).select_related('course_pack')
    courses = [purchase.course_pack for purchase in purchases]
    serializer = CoursePackSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chapter_progress(request, chapter_id):
    """Récupérer la progression d'un chapitre avec création automatique si nécessaire"""
    user = request.user
    
    try:
        chapter = Chapter.objects.get(id=chapter_id)
        course_pack = chapter.course_pack
        
        # Vérifier si l'utilisateur a acheté ce pack
        if not UserCoursePurchase.objects.filter(user=user, course_pack=course_pack).exists():
            return Response({'error': 'Pack de cours non acheté'}, status=status.HTTP_403_FORBIDDEN)
        
        # Essayer de récupérer la progression existante
        try:
            progress = ChapterProgress.objects.get(user=user, chapter_id=chapter_id)
        except ChapterProgress.DoesNotExist:
            # Créer automatiquement la progression si elle n'existe pas
            # Déterminer le statut basé sur l'ordre du chapitre
            chapters_before = Chapter.objects.filter(
                course_pack=course_pack,
                order__lt=chapter.order
            ).order_by('order')
            
            status = 'IN_PROGRESS'
            
            # Vérifier si tous les chapitres précédents sont terminés
            if chapters_before.exists():
                all_previous_completed = True
                for prev_chapter in chapters_before:
                    try:
                        prev_progress = ChapterProgress.objects.get(user=user, chapter=prev_chapter)
                        if prev_progress.status != 'COMPLETED':
                            all_previous_completed = False
                            break
                    except ChapterProgress.DoesNotExist:
                        all_previous_completed = False
                        break
                
                if not all_previous_completed:
                    status = 'LOCKED'
            
            progress = ChapterProgress.objects.create(
                user=user,
                chapter=chapter,
                status=status
            )
        
        serializer = ChapterProgressSerializer(progress)
        return Response(serializer.data)
        
    except Chapter.DoesNotExist:
        return Response({'error': 'Chapitre non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, chapter_id):
    """Récupérer le quiz d'un chapitre"""
    try:
        chapter = Chapter.objects.get(id=chapter_id)
        quiz = chapter.quiz
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)
    except (Chapter.DoesNotExist, Quiz.DoesNotExist):
        return Response({'error': 'Quiz non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, chapter_id):
    """Soumission et notation d'un quiz avec logique conditionnelle"""
    user = request.user
    
    try:
        chapter = Chapter.objects.get(id=chapter_id)
        quiz = chapter.quiz
        answers = request.data.get('answers', {})
        
        # Calculer le score
        total_points = 0
        earned_points = 0
        
        for question in quiz.questions.all():
            total_points += question.points
            selected_choice_id = answers.get(str(question.id))
            
            if selected_choice_id:
                try:
                    choice = QuizChoice.objects.get(id=selected_choice_id, question=question)
                    if choice.is_correct:
                        earned_points += question.points
                except QuizChoice.DoesNotExist:
                    pass
        
        # Score sur 20
        score = (earned_points / total_points * 20) if total_points > 0 else 0
        
        # Logique conditionnelle
        passed = score >= settings.QUIZ_PASS_THRESHOLD
        can_use_referral = settings.QUIZ_REFERRAL_THRESHOLD <= score < settings.QUIZ_PASS_THRESHOLD
        
        # Enregistrer la tentative
        attempt = QuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            score=score,
            passed=passed,
            can_retake=not passed
        )
        

        # Mettre à jour ou créer la progression
        progress, created = ChapterProgress.objects.get_or_create(
            user=user, 
            chapter=chapter,
            defaults={'status': 'IN_PROGRESS'}
        )
        
        response_data = {
            'score': score,
            'passed': passed,
            'can_use_referral_option': can_use_referral
        }
        
        if passed:
            progress.status = 'COMPLETED'
            progress.save()
            
            # Débloquer le chapitre suivant
            next_chapter = Chapter.objects.filter(
                course_pack=chapter.course_pack,
                order__gt=chapter.order
            ).first()
            
            if next_chapter:
                ChapterProgress.objects.get_or_create(
                    user=user,
                    chapter=next_chapter,
                    defaults={'status': 'IN_PROGRESS'}
                )
                response_data['next_chapter_id'] = next_chapter.id
            else:
                response_data['message'] = 'Formation terminée! Rendez-vous au centre physique.'
        
        elif can_use_referral:
            response_data['message'] = 'Parrainez 4 membres ou recommencez le chapitre'
            response_data['referrals_needed'] = settings.REFERRAL_REQUIRED_COUNT
            response_data['current_referrals'] = user.referrals.count()
        
        else:
            response_data['message'] = 'Vous devez recommencer le chapitre'
        
        return Response(response_data)
        
    except (Chapter.DoesNotExist, Quiz.DoesNotExist):
        return Response({'error': 'Quiz non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except ChapterProgress.DoesNotExist:
        return Response({'error': 'Chapitre non accessible'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_referral_bypass(request, chapter_id):
    """Utiliser l'option parrainage pour passer au chapitre suivant"""
    user = request.user
    
    # Vérifier nombre de parrainages
    referral_count = user.referrals.count()
    if referral_count < settings.REFERRAL_REQUIRED_COUNT:
        return Response({
            'error': f'Vous devez parrainer {settings.REFERRAL_REQUIRED_COUNT} membres',
            'current_referrals': referral_count
        }, status=status.HTTP_400_BAD_REQUEST)
    

    try:
        chapter = Chapter.objects.get(id=chapter_id)
        progress, created = ChapterProgress.objects.get_or_create(
            user=user, 
            chapter=chapter,
            defaults={'status': 'IN_PROGRESS'}
        )
        
        # Marquer le chapitre comme terminé
        progress.status = 'COMPLETED'
        progress.save()
        
        # Marquer l'option parrainage comme utilisée
        last_attempt = QuizAttempt.objects.filter(user=user, quiz=chapter.quiz).latest('attempted_at')
        last_attempt.referral_option_used = True
        last_attempt.save()
        
        # Débloquer le chapitre suivant
        next_chapter = Chapter.objects.filter(
            course_pack=chapter.course_pack,
            order__gt=chapter.order
        ).first()
        
        if next_chapter:
            ChapterProgress.objects.get_or_create(
                user=user,
                chapter=next_chapter,
                defaults={'status': 'IN_PROGRESS'}
            )
        
        return Response({'message': 'Chapitre validé par parrainage', 'next_chapter_id': next_chapter.id if next_chapter else None})
        
    except (Chapter.DoesNotExist, ChapterProgress.DoesNotExist):
        return Response({'error': 'Chapitre non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_physical_centers(request):
    """Récupérer les centres physiques de la ville de l'utilisateur"""
    user = request.user
    centers = PhysicalCenter.objects.filter(city=user.city, is_active=True)
    
    if not centers.exists():
        centers = PhysicalCenter.objects.filter(is_active=True)
    
    serializer = PhysicalCenterSerializer(centers, many=True)
    return Response(serializer.data)


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    """FAQ avec liste des questions-réponses"""
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_ai_faq(request):
    """Poser une question à l'IA sur Elite 2.0"""
    question = request.data.get('question')
    
    if not question:
        return Response({'error': 'Question requise'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Récupérer les FAQs pour contexte
    faqs = FAQ.objects.filter(is_active=True)
    context = "\n\n".join([f"Q: {faq.question}\nR: {faq.answer}" for faq in faqs[:10]])
    
    try:
        openai.api_key = settings.OPENAI_API_KEY
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"Tu es un assistant pour Elite 2.0, une plateforme de formation en ligne. Voici des informations de base:\n{context}"},
                {"role": "user", "content": question}
            ]
        )
        
        answer = response.choices[0].message.content
        return Response({'question': question, 'answer': answer})
        
    except Exception as e:
        return Response({'error': 'Erreur lors de la requête IA'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobOfferViewSet(viewsets.ReadOnlyModelViewSet):
    """Offres d'emploi disponibles"""
    queryset = JobOffer.objects.filter(is_active=True)
    serializer_class = JobOfferSerializer
    permission_classes = [IsAuthenticated]


class CompetitionViewSet(viewsets.ReadOnlyModelViewSet):
    """Concours disponibles"""
    queryset = Competition.objects.filter(is_active=True)
    serializer_class = CompetitionSerializer
    permission_classes = [IsAuthenticated]


class ReferralRewardViewSet(viewsets.ReadOnlyModelViewSet):
    """Récompenses disponibles par parrainage"""
    queryset = ReferralReward.objects.filter(is_active=True)
    serializer_class = ReferralRewardSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def redeem(self, request, pk=None):
        """Échanger des points contre une récompense"""
        reward = self.get_object()
        user = request.user
        
        if user.referral_points < reward.points_required:
            return Response({
                'error': 'Points insuffisants',
                'required': reward.points_required,
                'current': user.referral_points
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Déduire les points
        user.referral_points -= reward.points_required
        user.save()
        
        # Enregistrer l'échange
        redemption = ReferralRedemption.objects.create(
            user=user,
            reward=reward,
            points_spent=reward.points_required
        )
        
        # Attribuer la récompense
        if reward.reward_type == 'COURSE_PACK' and reward.course_pack:
            UserCoursePurchase.objects.create(
                user=user,
                course_pack=reward.course_pack,
                payment_method='REFERRAL_POINTS',
                amount_paid=0
            )
        
        return Response({'message': 'Récompense obtenue avec succès', 'remaining_points': user.referral_points})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_referral_stats(request):
    """Statistiques de parrainage de l'utilisateur"""
    user = request.user
    referrals = user.referrals.all()
    
    return Response({
        'referral_code': user.referral_code,
        'total_referrals': referrals.count(),
        'referral_points': user.referral_points,
        'referrals': UserSerializer(referrals, many=True).data
    })


class ChatMessageViewSet(viewsets.ModelViewSet):
    """Messagerie entre utilisateurs"""
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatMessage.objects.filter(
            sender=user
        ) | ChatMessage.objects.filter(recipient=user)
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Liste des conversations de l'utilisateur"""
        user = self.request.user

        # Récupérer tous les utilisateurs avec qui il a échangé
        sent_to = ChatMessage.objects.filter(sender=user).values_list('recipient', flat=True).distinct()
        received_from = ChatMessage.objects.filter(recipient=user).values_list('sender', flat=True).distinct()

        user_ids = set(list(sent_to) + list(received_from))
        users = User.objects.filter(id__in=user_ids)

        # Retourner seulement les champs nécessaires pour le frontend
        conversations_data = [
            {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
            for user in users
        ]

        return Response(conversations_data)
    
    @action(detail=False, methods=['get'])
    def with_user(self, request):
        """Messages avec un utilisateur spécifique"""
        user = self.request.user
        other_user_id = request.query_params.get('user_id')
        
        if not other_user_id:
            return Response({'error': 'user_id requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        messages = ChatMessage.objects.filter(
            (Q(sender=user) & Q(recipient_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(recipient=user))
        ).order_by('created_at')
        
        # Marquer comme lu
        messages.filter(recipient=user, is_read=False).update(is_read=True)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Rechercher des utilisateurs par nom ou username"""
    query = request.query_params.get('q', '').strip()

    if not query:
        return Response({'error': 'Paramètre de recherche requis'}, status=status.HTTP_400_BAD_REQUEST)

    # Rechercher par first_name, last_name ou username
    users = User.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(username__icontains=query)
    ).exclude(id=request.user.id)[:20]  # Limiter à 20 résultats, exclure l'utilisateur actuel

    # Retourner seulement les champs nécessaires
    users_data = [
        {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }
        for user in users
    ]

    return Response(users_data)

