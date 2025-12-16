#!/usr/bin/env python
"""
Script de génération de données de test supplémentaires pour Elite 2.0
Génère encore plus de données réalistes
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

def generate_more_users(count=100):
    """Génère 100 utilisateurs supplémentaires avec profils variés"""
    print(f"Génération de {count} utilisateurs supplémentaires...")
    
    # Profils métier français
    job_titles = [
        'Étudiant', 'Développeur Junior', 'Chef de Projet', 'Commercial',
        'Assistant Marketing', 'Comptable', 'Gestionnaire', 'Consultant',
        'Designer', 'Formateur', 'Responsable RH', 'Ingénieur',
        'Analyste', 'Technicien', 'Secrétaire', 'Architecte',
        'Pharmacien', 'Infirmier', 'Avocat', 'Commerçant'
    ]
    
    # Villes françaises
    cities = [
        'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
        'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Le Havre', 'Reims',
        'Saint-Étienne', 'Toulon', 'Angers', 'Grenoble', 'Dijon', 'Nîmes', 'Aix-en-Provence'
    ]
    
    users = []
    for i in range(count):
        # Noms français plus réalistes
        if random.choice([True, False]):
            first_name = fake.first_name_male()
            gender = 'M'
        else:
            first_name = fake.first_name_female()
            gender = 'F'
            
        last_name = fake.last_name()
        
        # Username plus naturel
        if random.choice([True, False]):
            username = f"{first_name.lower()}.{last_name.lower()}"
        else:
            username = f"{first_name.lower()}{last_name.lower()}"
        
        email = f"{username}@{fake.free_email_domain()}"
        
        # Choix académique plus varié
        level_choices = ['BEPC', 'BAC', 'LICENCE', 'MASTER', 'DOCTORAT']
        weights = [25, 30, 25, 15, 5]  # Probabilités réalistes
        academic_level = random.choices(level_choices, weights=weights)[0]
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password='password123',
            first_name=first_name,
            last_name=last_name,
            phone=fake.phone_number(),
            city=random.choice(cities),
            academic_level=academic_level,
            referral_points=random.randint(0, 1000),
            has_completed_matching=random.choice([True, False])
        )
        users.append(user)
        
    print(f"✅ {len(users)} utilisateurs supplémentaires créés")
    return users

def generate_adaptive_paths(profiles):
    """Génère des parcours adaptatifs pour chaque profil"""
    print("Génération des parcours adaptatifs...")
    
    # Étapes de parcours réalistes
    path_templates = {
        'BEPC': {
            'duration_months': 6,
            'steps': [
                "Formation de base",
                "Stage pratique",
                "Certification initiale",
                "Projet personnel"
            ]
        },
        'BAC': {
            'duration_months': 8,
            'steps': [
                "Apprentissage théorique approfondi",
                "Travaux pratiques dirigés",
                "Stage en entreprise (2 mois)",
                "Certification professionnelle",
                "Portfolio de projets"
            ]
        },
        'LICENCE': {
            'duration_months': 12,
            'steps': [
                "Formation théorique avancée",
                "Projets pratiques complexes",
                "Stage long en entreprise (4 mois)",
                "Mémoire de fin d'études",
                "Certification professionnelle",
                "Network professionnel"
            ]
        }
    }
    
    paths_count = 0
    for profile in profiles:
        for level in ['BEPC', 'BAC', 'LICENCE']:
            template = path_templates[level]
            AdaptivePath.objects.create(
                profile=profile,
                academic_level=level,
                steps=template['steps'],
                duration_months=template['duration_months']
            )
            paths_count += 1
            
    print(f"✅ {paths_count} parcours adaptatifs créés")
    return paths_count

def generate_user_path_validations(users, adaptive_paths):
    """Génère des validations de parcours par les utilisateurs"""
    print("Génération des validations de parcours...")
    
    # 70% des utilisateurs ont validé un parcours
    validated_users = random.sample(users, int(len(users) * 0.7))
    
    validations_count = 0
    for user in validated_users:
        # Choisir un parcours adaptatif au hasard
        path = random.choice(adaptive_paths)
        
        UserPathValidation.objects.create(
            user=user,
            adaptive_path=path,
            is_started=random.choice([True, False]),
            started_at=fake.date_time_between(start_date='-30d', end_date='now') if random.choice([True, False]) else None
        )
        validations_count += 1
        
    print(f"✅ {validations_count} validations de parcours créées")
    return validations_count

def generate_user_matching_responses(users, questions, answers):
    """Génère des réponses de matching pour les utilisateurs"""
    print("Génération des réponses de matching...")
    
    # Générer des réponses réalistes
    responses_count = 0
    for user in random.sample(users, int(len(users) * 0.8)):  # 80% des utilisateurs
        for question in questions:
            # Sélectionner une réponse au hasard pour cette question
            available_answers = answers.filter(question=question)
            if available_answers.exists():
                selected_answer = random.choice(available_answers)
                UserMatchingResponse.objects.create(
                    user=user,
                    question=question,
                    selected_answer=selected_answer
                )
                responses_count += 1
                
    print(f"✅ {responses_count} réponses de matching créées")
    return responses_count

def generate_user_purchases(users, course_packs):
    """Génère des achats de packs de cours"""
    print("Génération des achats de cours...")
    
    payment_methods = ['Carte bancaire', 'PayPal', 'Virement', 'Chèque', 'Espèces']
    
    purchases_count = 0
    for user in random.sample(users, int(len(users) * 0.4)):  # 40% des utilisateurs ont acheté
        # Choisir 1-3 packs au hasard
        num_packs = random.randint(1, 3)
        selected_packs = random.sample(list(course_packs), min(num_packs, len(course_packs)))
        
        for pack in selected_packs:
            UserCoursePurchase.objects.create(
                user=user,
                course_pack=pack,
                payment_method=random.choice(payment_methods),
                amount_paid=pack.price
            )
            purchases_count += 1
            
    print(f"✅ {purchases_count} achats de cours créés")
    return purchases_count

def generate_chapter_progress(users, chapters):
    """Génère de la progression dans les chapitres"""
    print("Génération de la progression des chapitres...")
    
    progress_count = 0
    # Sélectionner 60% des utilisateurs qui ont de la progression
    active_users = random.sample(users, int(len(users) * 0.6))
    
    for user in active_users:
        # Sélectionner 2-8 chapitres au hasard
        num_chapters = random.randint(2, 8)
        selected_chapters = random.sample(list(chapters), min(num_chapters, len(chapters)))
        
        for chapter in selected_chapters:
            status = random.choices(
                ['IN_PROGRESS', 'COMPLETED', 'LOCKED'],
                weights=[30, 50, 20]
            )[0]
            
            ChapterProgress.objects.create(
                user=user,
                chapter=chapter,
                status=status,
                last_accessed=fake.date_time_between(start_date='-7d', end_date='now')
            )
            progress_count += 1
            
    print(f"✅ {progress_count} progressions de chapitres créées")
    return progress_count

def generate_quiz_attempts(users, quizzes):
    """Génère des tentatives de quiz"""
    print("Génération des tentatives de quiz...")
    
    attempts_count = 0
    # Sélectionner 50% des utilisateurs qui ont passé des quiz
    quiz_users = random.sample(users, int(len(users) * 0.5))
    
    for user in quiz_users:
        # 1-5 tentatives par utilisateur
        num_attempts = random.randint(1, 5)
        selected_quizzes = random.sample(list(quizzes), min(num_attempts, len(quizzes)))
        
        for quiz in selected_quizzes:
            # Score entre 0 et 20, majorité entre 10 et 18
            score_weights = [5, 10, 15, 20, 20, 15, 10, 5]  # Distribution réaliste
            score = random.choices(range(0, 21), weights=score_weights)[0]
            
            QuizAttempt.objects.create(
                user=user,
                quiz=quiz,
                score=score,
                passed=score >= quiz.passing_score,
                can_retake=score < quiz.passing_score and random.choice([True, False]),
                referral_option_used=random.choice([True, False])
            )
            attempts_count += 1
            
    print(f"✅ {attempts_count} tentatives de quiz créées")
    return attempts_count

def generate_more_job_offers(count=70):
    """Génère 70 offres d'emploi supplémentaires"""
    print(f"Génération de {count} offres d'emploi supplémentaires...")
    
    companies = [
        'Google France', 'Microsoft', 'Amazon', 'Apple', 'Meta',
        'Airbus', 'BNP Paribas', 'Société Générale', 'Dassault',
        'Schneider Electric', 'Capgemini', 'Accenture', 'Sopra Steria',
        'Orange', 'SFR', 'Bouygues Telecom', 'L\'Oréal', 'Unilever',
        'Nestlé', 'Carrefour', 'Auchan', 'Fnac', 'Cdiscount',
        'Vente-Privée', 'Zalando', 'Shopify', 'Stripe', 'PayPal',
        'DataRobot', 'Palantir', 'Criteo', 'Voodoo', 'Sketchfab'
    ]
    
    job_titles = [
        'Développeur Full-Stack', 'Data Scientist', 'Chef de Produit',
        'Marketing Manager', 'Consultant IT', 'Analyste Fonctionnel',
        'UX/UI Designer', 'DevOps Engineer', 'Product Manager',
        'Spécialiste SEO', 'Community Manager', 'Business Analyst',
        'Ingénieur DevOps', 'Développeur Mobile', 'Architecte Logiciel',
        'Data Engineer', 'ML Engineer', 'Cloud Architect',
        'Security Engineer', 'Scrum Master', 'Tech Lead',
        'Growth Hacker', 'Content Manager', 'Social Media Specialist',
        'CRM Manager', 'Marketing Automation Specialist', 'Performance Marketing',
        'Affiliate Manager', 'Partnership Manager', 'Customer Success Manager'
    ]
    
    locations = [
        'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes',
        'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes',
        'Grenoble', 'Dijon', 'Nîmes', 'Toulon', 'Angers', 'Le Havre',
        'Saint-Étienne', 'Tours', 'Clermont-Ferrand', 'Brest', 'Amiens'
    ]
    
    for i in range(count):
        JobOffer.objects.create(
            title=random.choice(job_titles),
            company=random.choice(companies),
            location=random.choice(locations),
            description=fake.text(max_nb_chars=400),
            requirements=fake.text(max_nb_chars=300),
            salary_range=f"{random.randint(30000, 60000)}€ - {random.randint(50000, 150000)}€",
            application_url=fake.url(),
            posted_date=fake.date_between(start_date='-60d', end_date='today'),
            expiry_date=fake.date_between(start_date='+1d', end_date='+90d'),
            is_active=random.choice([True, False, True, True])  # 75% actives
        )
        
    print(f"✅ {count} offres d'emploi supplémentaires créées")

def generate_more_competitions(count=35):
    """Génère 35 concours supplémentaires"""
    print(f"Génération de {count} concours supplémentaires...")
    
    competition_types = [
        'Concours d\'Entrée en École d\'Ingénieurs', 'Concours de la Fonction Publique',
        'Hackathon Innovation Tech', 'Concours de Création d\'Entreprise',
        'Concours National de Mathématiques', 'Concours de Design UX/UI',
        'Concours de Réseaux Sociaux', 'Challenge Data Science',
        'Concours d\'Innovation Numérique', 'Concours de Marketing Digital',
        'Concours de Programmation', 'Concours de Business Case',
        'Concours de Pitch', 'Concours de Prototypage',
        'Concours d\'Idées', 'Concours d\'Entrepreneuriat',
        'Concours de Recherche', 'Concours Académique'
    ]
    
    organizers = [
        'Ministère de l\'Éducation', 'École Polytechnique', 'HEC Paris',
        'INSA', 'CentraleSupélec', 'Télécom ParisTech', 'ENS',
        'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
        'BNP Paribas', 'Société Générale', 'Airbus', 'Dassault',
        'McKinsey', 'BCG', 'Bain', 'Capgemini', 'Accenture'
    ]
    
    for i in range(count):
        Competition.objects.create(
            title=f"{random.choice(competition_types)} {i+1}",
            organizer=random.choice(organizers),
            description=fake.text(max_nb_chars=400),
            eligibility=fake.text(max_nb_chars=300),
            registration_url=fake.url(),
            registration_deadline=fake.date_between(start_date='+1d', end_date='+120d'),
            exam_date=fake.date_between(start_date='+31d', end_date='+180d'),
            is_active=random.choice([True, False, True, True, True])  # 80% actifs
        )
        
    print(f"✅ {count} concours supplémentaires créés")

def generate_referral_redemptions(users, rewards):
    """Génère des échanges de points de parrainage"""
    print("Génération des échanges de points...")
    
    redemptions_count = 0
    # Sélectionner 30% des utilisateurs qui ont échangé des points
    redeeming_users = random.sample(users, int(len(users) * 0.3))
    
    for user in redeeming_users:
        # 1-3 échanges par utilisateur
        num_redemptions = random.randint(1, 3)
        selected_rewards = random.sample(list(rewards), min(num_redemptions, len(rewards)))
        
        for reward in selected_rewards:
            if user.referral_points >= reward.points_required:
                ReferralRedemption.objects.create(
                    user=user,
                    reward=reward,
                    points_spent=reward.points_required
                )
                redemptions_count += 1
                
                # Réduire les points de l'utilisateur
                user.referral_points -= reward.points_required
                user.save()
                
    print(f"✅ {redemptions_count} échanges de points créés")
    return redemptions_count

def generate_extended_chat_messages(users, count=300):
    """Génère 300 messages de chat supplémentaires"""
    print(f"Génération de {count} messages de chat supplémentaires...")
    
    # Messages plus réalistes et variés
    message_templates = [
        "Salut ! Comment ça va ?",
        "Tu as vu la nouvelle formation ?",
        "Je recommande vraiment ce cours !",
        "As-tu passé le quiz de hier ?",
        "Le chapitre 3 était difficile",
        "Quel est ton profil recommandé ?",
        "On pourrait étudier ensemble ?",
        "J'ai une question sur l'exercice 2",
        "Le prochain concours m'intéresse",
        "As-tu des conseils pour le matching ?",
        "La formation est très complète",
        "Merci pour l'aide !",
        "Bonne chance pour ton examen",
        "On se voit au centre physique ?",
        "L'interface mobile est super",
        "Je viens de terminer un chapitre",
        "Le forum de discussion manque",
        "Les vidéos sont très claires",
        "Quel pack de cours recommandes-tu ?",
        "J'ai besoin d'aide pour le paiement"
    ]
    
    for i in range(count):
        sender = random.choice(users)
        recipient = random.choice([u for u in users if u != sender])
        
        message = random.choice(message_templates)
        if random.choice([True, False]):  # 50% de chance d'ajouter des mots
            message += f" {fake.sentence(nb_words=random.randint(2, 8))}"
        
        ChatMessage.objects.create(
            sender=sender,
            recipient=recipient,
            message=message,
            is_read=random.choice([True, False]),
            created_at=fake.date_time_between(start_date='-30d', end_date='now')
        )
        
    print(f"✅ {count} messages de chat supplémentaires créés")

def main():
    """Fonction principale pour générer plus de données"""
    print("🚀 Génération de données de test supplémentaires pour Elite 2.0")
    print("=" * 70)
    
    # Récupérer les données existantes
    users = list(User.objects.all())
    profiles = list(Profile.objects.all())
    questions = list(MatchingQuestion.objects.all())
    answers = list(MatchingAnswer.objects.all())
    course_packs = list(CoursePack.objects.all())
    chapters = list(Chapter.objects.all())
    quizzes = list(Quiz.objects.all())
    rewards = list(ReferralReward.objects.all())
    
    print(f"📊 Données existantes: {len(users)} utilisateurs, {len(profiles)} profils")
    
    # Générer plus de données
    more_users = generate_more_users(100)
    users.extend(more_users)
    
    generate_adaptive_paths(profiles)
    generate_user_path_validations(users, list(AdaptivePath.objects.all()))
    generate_user_matching_responses(users, questions, answers)
    generate_user_purchases(users, course_packs)
    generate_chapter_progress(users, chapters)
    generate_quiz_attempts(users, quizzes)
    generate_more_job_offers(70)
    generate_more_competitions(35)
    generate_referral_redemptions(users, rewards)
    generate_extended_chat_messages(users, 300)
    
    print("=" * 70)
    print("🎉 Génération supplémentaire terminée avec succès !")
    print(f"📊 NOUVELLES STATISTIQUES:")
    print(f"   - {User.objects.count()} utilisateurs au total")
    print(f"   - {JobOffer.objects.count()} offres d'emploi")
    print(f"   - {Competition.objects.count()} concours")
    print(f"   - {ChatMessage.objects.count()} messages de chat")
    print(f"   - {UserMatchingResponse.objects.count()} réponses de matching")
    print(f"   - {UserCoursePurchase.objects.count()} achats de cours")
    print(f"   - {ChapterProgress.objects.count()} progressions")
    print(f"   - {QuizAttempt.objects.count()} tentatives de quiz")
    print(f"   - {AdaptivePath.objects.count()} parcours adaptatifs")
    print(f"   - {ReferralRedemption.objects.count()} échanges de points")
    print("=" * 70)

if __name__ == '__main__':
    main()

