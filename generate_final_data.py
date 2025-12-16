#!/usr/bin/env python
"""
Script rapide pour générer les dernières données de test pour Elite 2.0
Version simplifiée et optimisée
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal
from faker import Faker

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

# Import des modèles après configuration Django
from django.contrib.auth import get_user_model
from core.models import (
    MatchingQuestion, MatchingAnswer, UserMatchingResponse, Profile, AdaptivePath,
    UserPathValidation, CoursePack, Chapter, Quiz, QuizQuestion, QuizChoice,
    UserCoursePurchase, ChapterProgress, QuizAttempt, PhysicalCenter, FAQCategory,
    FAQ, JobOffer, Competition, ReferralReward, ReferralRedemption, ChatMessage
)

# Initialiser Faker
fake = Faker('fr_FR')

User = get_user_model()

def generate_quick_data():
    """Génère rapidement les données manquantes"""
    print("🚀 Génération rapide des données finales...")
    
    # Récupérer les données existantes
    users = list(User.objects.all())
    profiles = list(Profile.objects.all())
    questions = list(MatchingQuestion.objects.all())
    answers = list(MatchingAnswer.objects.all())
    course_packs = list(CoursePack.objects.all())
    chapters = list(Chapter.objects.all())
    quizzes = list(Quiz.objects.all())
    rewards = list(ReferralReward.objects.all())
    
    print(f"📊 Utilisation de {len(users)} utilisateurs existants")
    
    # 1. Générer des parcours adaptatifs
    print("📈 Génération des parcours adaptatifs...")
    paths_count = 0
    for profile in profiles:
        for level in ['BEPC', 'BAC', 'LICENCE']:
            AdaptivePath.objects.get_or_create(
                profile=profile,
                academic_level=level,
                defaults={
                    'steps': [f"Étape {i+1} pour {level}" for i in range(4)],
                    'duration_months': random.randint(6, 12)
                }
            )
            paths_count += 1
    print(f"✅ {paths_count} parcours adaptatifs")
    

    # 2. Générer des réponses de matching
    print("❓ Génération des réponses de matching...")
    response_count = 0
    for user in random.sample(users, int(len(users) * 0.7)):  # 70% des utilisateurs
        for question in questions:
            available_answers = MatchingAnswer.objects.filter(question=question)
            if available_answers.exists():
                selected_answer = random.choice(available_answers)
                UserMatchingResponse.objects.get_or_create(
                    user=user,
                    question=question,
                    defaults={'selected_answer': selected_answer}
                )
                response_count += 1
    print(f"✅ {response_count} réponses de matching")
    
    # 3. Générer des achats de cours
    print("🛒 Génération des achats de cours...")
    purchase_count = 0
    for user in random.sample(users, int(len(users) * 0.4)):  # 40% ont acheté
        for pack in random.sample(course_packs, random.randint(1, 3)):
            UserCoursePurchase.objects.get_or_create(
                user=user,
                course_pack=pack,
                defaults={
                    'payment_method': random.choice(['Carte bancaire', 'PayPal', 'Virement']),
                    'amount_paid': pack.price
                }
            )
            purchase_count += 1
    print(f"✅ {purchase_count} achats de cours")
    
    # 4. Générer de la progression dans les chapitres
    print("📊 Génération de la progression...")
    progress_count = 0
    for user in random.sample(users, int(len(users) * 0.6)):  # 60% ont de la progression
        for chapter in random.sample(chapters, random.randint(2, 6)):
            status = random.choices(['IN_PROGRESS', 'COMPLETED', 'LOCKED'], weights=[30, 50, 20])[0]
            ChapterProgress.objects.get_or_create(
                user=user,
                chapter=chapter,
                defaults={
                    'status': status,
                    'last_accessed': fake.date_time_between(start_date='-7d', end_date='now')
                }
            )
            progress_count += 1
    print(f"✅ {progress_count} progressions de chapitres")
    
    # 5. Générer des tentatives de quiz
    print("🎯 Génération des tentatives de quiz...")
    attempt_count = 0
    for user in random.sample(users, int(len(users) * 0.5)):  # 50% ont passé des quiz
        for quiz in random.sample(quizzes, random.randint(1, 3)):
            score = random.randint(8, 20)  # Scores réalistes
            QuizAttempt.objects.get_or_create(
                user=user,
                quiz=quiz,
                defaults={
                    'score': score,
                    'passed': score >= quiz.passing_score,
                    'can_retake': score < quiz.passing_score,
                    'referral_option_used': random.choice([True, False])
                }
            )
            attempt_count += 1
    print(f"✅ {attempt_count} tentatives de quiz")
    
    # 6. Générer des validations de parcours
    print("✅ Génération des validations de parcours...")
    validation_count = 0
    paths = list(AdaptivePath.objects.all())
    for user in random.sample(users, int(len(users) * 0.3)):  # 30% ont validé un parcours
        path = random.choice(paths)
        UserPathValidation.objects.get_or_create(
            user=user,
            defaults={
                'adaptive_path': path,
                'is_started': random.choice([True, False]),
                'started_at': fake.date_time_between(start_date='-30d', end_date='now') if random.choice([True, False]) else None
            }
        )
        validation_count += 1
    print(f"✅ {validation_count} validations de parcours")
    
    # 7. Générer des échanges de points
    print("🎁 Génération des échanges de points...")
    redemption_count = 0
    for user in random.sample(users, int(len(users) * 0.2)):  # 20% ont échangé des points
        reward = random.choice(rewards)
        if user.referral_points >= reward.points_required:
            ReferralRedemption.objects.get_or_create(
                user=user,
                reward=reward,
                defaults={'points_spent': reward.points_required}
            )
            user.referral_points -= reward.points_required
            user.save()
            redemption_count += 1
    print(f"✅ {redemption_count} échanges de points")
    
    # 8. Ajouter plus d'offres d'emploi et concours
    print("💼 Ajout d'offres d'emploi...")
    companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Airbus', 'BNP Paribas']
    job_titles = ['Développeur', 'Data Scientist', 'Chef de Projet', 'Designer', 'Consultant']
    
    for i in range(50):
        JobOffer.objects.get_or_create(
            title=f"{random.choice(job_titles)} {i+1}",
            company=random.choice(companies),
            defaults={
                'location': fake.city(),
                'description': fake.text(max_nb_chars=300),
                'requirements': fake.text(max_nb_chars=200),
                'salary_range': f"{random.randint(35000, 80000)}€",
                'application_url': fake.url(),
                'posted_date': fake.date_between(start_date='-30d', end_date='today'),
                'expiry_date': fake.date_between(start_date='+1d', end_date='+60d')
            }
        )
    print("✅ 50 offres d'emploi supplémentaires")
    
    print("🏆 Ajout de concours...")
    for i in range(20):
        Competition.objects.get_or_create(
            title=f"Concours {i+1}",
            organizer=fake.company(),
            defaults={
                'description': fake.text(max_nb_chars=300),
                'eligibility': fake.text(max_nb_chars=200),
                'registration_url': fake.url(),
                'registration_deadline': fake.date_between(start_date='+1d', end_date='+90d'),
                'exam_date': fake.date_between(start_date='+31d', end_date='+120d')
            }
        )
    print("✅ 20 concours supplémentaires")
    
    # 9. Ajouter plus de messages de chat
    print("💬 Ajout de messages de chat...")
    message_templates = [
        "Salut ! Comment ça va ?", "Tu as vu la nouvelle formation ?",
        "Je recommande ce cours !", "As-tu passé le quiz ?",
        "Le chapitre était difficile", "Quel est ton profil ?",
        "On pourrait étudier ensemble ?", "J'ai une question",
        "Bonne chance pour l'examen !", "L'interface est super"
    ]
    
    for i in range(200):
        sender = random.choice(users)
        recipient = random.choice([u for u in users if u != sender])
        ChatMessage.objects.get_or_create(
            sender=sender,
            recipient=recipient,
            defaults={
                'message': random.choice(message_templates),
                'is_read': random.choice([True, False]),
                'created_at': fake.date_time_between(start_date='-15d', end_date='now')
            }
        )
    print("✅ 200 messages de chat supplémentaires")
    
    return True

def show_final_stats():
    """Affiche les statistiques finales"""
    print("\n" + "="*60)
    print("🎉 GÉNÉRATION TERMINÉE AVEC SUCCÈS !")
    print("="*60)
    
    print(f"👥 Utilisateurs: {User.objects.count()}")
    print(f"📋 Profils: {Profile.objects.count()}")
    print(f"❓ Questions matching: {MatchingQuestion.objects.count()}")
    print(f"💬 Réponses matching: {MatchingAnswer.objects.count()}")
    print(f"📝 Réponses utilisateurs: {UserMatchingResponse.objects.count()}")
    print(f"📚 Packs de cours: {CoursePack.objects.count()}")
    print(f"📖 Chapitres: {Chapter.objects.count()}")
    print(f"🧩 Quiz: {Quiz.objects.count()}")
    print(f"🎯 Tentatives quiz: {QuizAttempt.objects.count()}")
    print(f"📊 Progression chapitres: {ChapterProgress.objects.count()}")
    print(f"📈 Parcours adaptatifs: {AdaptivePath.objects.count()}")
    print(f"✅ Validations parcours: {UserPathValidation.objects.count()}")
    print(f"🛒 Achats de cours: {UserCoursePurchase.objects.count()}")
    print(f"💼 Offres d'emploi: {JobOffer.objects.count()}")
    print(f"🏆 Concours: {Competition.objects.count()}")
    print(f"🏢 Centres physiques: {PhysicalCenter.objects.count()}")
    print(f"❓ FAQ: {FAQ.objects.count()}")
    print(f"🎁 Récompenses: {ReferralReward.objects.count()}")
    print(f"🎁 Échanges de points: {ReferralRedemption.objects.count()}")
    print(f"💬 Messages de chat: {ChatMessage.objects.count()}")
    
    print("\n🎯 EXEMPLES D'UTILISATEURS:")
    for user in User.objects.all()[:5]:
        print(f"   - {user.username} ({user.first_name} {user.last_name}) - {user.academic_level}")
    
    print("\n💼 EXEMPLES D'OFFRES:")
    for job in JobOffer.objects.all()[:3]:
        print(f"   - {job.title} chez {job.company}")
    
    print("\n💬 EXEMPLES DE CONVERSATIONS:")
    conversations = ChatMessage.objects.values('sender__username', 'recipient__username').distinct()[:3]
    for conv in conversations:
        print(f"   - {conv['sender__username']} ↔ {conv['recipient__username']}")
    
    print("\n" + "="*60)
    print("🚀 VOTRE APPLICATION A MAINTENANT BEAUCOUP DE DONNÉES DE TEST !")
    print("="*60)

def main():
    """Fonction principale"""
    print("🚀 Démarrage de la génération finale des données...")
    
    try:
        generate_quick_data()
        show_final_stats()
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    return True

if __name__ == '__main__':
    main()

