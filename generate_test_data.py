#!/usr/bin/env python
"""
Script de génération de données de test pour Elite 2.0
Génère des données réalistes pour tous les modèles
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

def generate_users(count=50):
    """Génère des utilisateurs de test"""
    print(f"Génération de {count} utilisateurs...")
    
    users = []
    for i in range(count):
        first_name = fake.first_name()
        last_name = fake.last_name()
        username = f"{first_name.lower()}{last_name.lower()}{random.randint(1, 999)}"
        email = f"{username}@{fake.free_email_domain()}"
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password='password123',
            first_name=first_name,
            last_name=last_name,
            phone=fake.phone_number(),
            city=fake.city(),
            academic_level=random.choice(['BEPC', 'BAC', 'LICENCE']),
            referral_points=random.randint(0, 500)
        )
        users.append(user)
        
    print(f"✅ {len(users)} utilisateurs créés")
    return users

def generate_profiles():
    """Génère des profils professionnels"""
    print("Génération des profils...")
    
    profiles_data = [
        {
            'name': 'Développeur Web Full-Stack',
            'description': 'Formation complète en développement web avec les technologies modernes',
            'category': 'Technologie'
        },
        {
            'name': 'Data Scientist',
            'description': 'Spécialisation en analyse de données et intelligence artificielle',
            'category': 'Technologie'
        },
        {
            'name': 'Marketing Digital',
            'description': 'Stratégies digitales, réseaux sociaux et e-commerce',
            'category': 'Marketing'
        },
        {
            'name': 'Gestionnaire de Projet',
            'description': 'Management et pilotage de projets informatiques',
            'category': 'Management'
        },
        {
            'name': 'Expert Comptabilité',
            'description': 'Comptabilité générale et gestion financière',
            'category': 'Finance'
        },
        {
            'name': 'Chef de Produit',
            'description': 'Stratégie produit et innovation technologique',
            'category': 'Marketing'
        },
        {
            'name': 'Consultant en Organisation',
            'description': 'Optimisation des processus et transformation digitale',
            'category': 'Consulting'
        },
        {
            'name': 'Spécialiste Cybersécurité',
            'description': 'Sécurité informatique et protection des données',
            'category': 'Technologie'
        }
    ]
    
    profiles = []
    for data in profiles_data:
        profile = Profile.objects.create(**data)
        profiles.append(profile)
        
    print(f"✅ {len(profiles)} profils créés")
    return profiles

def generate_matching_questions():
    """Génère des questions de matching"""
    print("Génération des questions de matching...")
    
    questions_data = [
        {
            'text': 'Quel est votre niveau d\'études actuel ?',
            'order': 1
        },
        {
            'text': 'Quel domaine vous passionne le plus ?',
            'order': 2
        },
        {
            'text': 'Combien d\'heures par semaine pouvez-vous consacrer à votre formation ?',
            'order': 3
        },
        {
            'text': 'Préférez-vous apprendre de manière théorique ou pratique ?',
            'order': 4
        },
        {
            'text': 'Quel est votre objectif principal ?',
            'order': 5
        }
    ]
    
    questions = []
    for data in questions_data:
        question = MatchingQuestion.objects.create(**data)
        questions.append(question)
        
    print(f"✅ {len(questions)} questions créées")
    return questions

def generate_matching_answers(profiles, questions):
    """Génère des réponses aux questions de matching"""
    print("Génération des réponses de matching...")
    
    answers_data = [
        # Questions sur le niveau d'études
        {'question': questions[0], 'text': 'Lycée (Terminale)', 'profile_weights': {str(profiles[0].id): 8, str(profiles[1].id): 6}},
        {'question': questions[0], 'text': 'Baccalauréat', 'profile_weights': {str(profiles[0].id): 7, str(profiles[1].id): 7, str(profiles[2].id): 8}},
        {'question': questions[0], 'text': 'Bac+1 ou Bac+2', 'profile_weights': {str(profiles[0].id): 8, str(profiles[1].id): 9, str(profiles[2].id): 9}},
        {'question': questions[0], 'text': 'Bac+3 ou plus', 'profile_weights': {str(profiles[0].id): 9, str(profiles[1].id): 10, str(profiles[3].id): 9, str(profiles[4].id): 8}},
        
        # Questions sur les domaines
        {'question': questions[1], 'text': 'Informatique et technologie', 'profile_weights': {str(profiles[0].id): 10, str(profiles[1].id): 10, str(profiles[7].id): 10}},
        {'question': questions[1], 'text': 'Marketing et communication', 'profile_weights': {str(profiles[2].id): 10, str(profiles[5].id): 10}},
        {'question': questions[1], 'text': 'Gestion et management', 'profile_weights': {str(profiles[3].id): 10, str(profiles[6].id): 10}},
        {'question': questions[1], 'text': 'Finance et comptabilité', 'profile_weights': {str(profiles[4].id): 10}},
        
        # Questions sur le temps disponible
        {'question': questions[2], 'text': 'Moins de 5 heures/semaine', 'profile_weights': {str(profiles[0].id): 6, str(profiles[2].id): 7}},
        {'question': questions[2], 'text': '5-10 heures/semaine', 'profile_weights': {str(profiles[0].id): 8, str(profiles[1].id): 8, str(profiles[2].id): 9}},
        {'question': questions[2], 'text': 'Plus de 10 heures/semaine', 'profile_weights': {str(profiles[1].id): 10, str(profiles[3].id): 9}},
        
        # Questions sur l'approche d'apprentissage
        {'question': questions[3], 'text': 'Apprentissage théorique', 'profile_weights': {str(profiles[4].id): 9, str(profiles[6].id): 8}},
        {'question': questions[3], 'text': 'Apprentissage pratique', 'profile_weights': {str(profiles[0].id): 10, str(profiles[1].id): 10}},
        {'question': questions[3], 'text': 'Mix théorie et pratique', 'profile_weights': {str(profiles[2].id): 10, str(profiles[3].id): 9, str(profiles[5].id): 9}},
        
        # Questions sur les objectifs
        {'question': questions[4], 'text': 'Obtenir un emploi rapidement', 'profile_weights': {str(profiles[0].id): 9, str(profiles[2].id): 8}},
        {'question': questions[4], 'text': 'Évoluer dans mon métier actuel', 'profile_weights': {str(profiles[3].id): 10, str(profiles[6].id): 9}},
        {'question': questions[4], 'text': 'Créer ma propre entreprise', 'profile_weights': {str(profiles[5].id): 10, str(profiles[6].id): 8}},
    ]
    
    answers = []
    for data in answers_data:
        answer = MatchingAnswer.objects.create(**data)
        answers.append(answer)
        
    print(f"✅ {len(answers)} réponses créées")
    return answers

def generate_course_packs(profiles):
    """Génère des packs de cours"""
    print("Génération des packs de cours...")
    
    course_packs_data = [
        {
            'title': 'Formation Complète Développeur Web',
            'domain': 'Développement Web',
            'description': 'Maîtrisez HTML, CSS, JavaScript, React, Node.js et les bases de données',
            'price': Decimal('299.99'),
            'profile': profiles[0]
        },
        {
            'title': 'Data Science avec Python',
            'domain': 'Data Science',
            'description': 'Analyse de données, Machine Learning, visualisation avec Python',
            'price': Decimal('399.99'),
            'profile': profiles[1]
        },
        {
            'title': 'Marketing Digital Avancé',
            'domain': 'Marketing',
            'description': 'SEO, SEM, réseaux sociaux, analytics et automation marketing',
            'price': Decimal('249.99'),
            'profile': profiles[2]
        },
        {
            'title': 'Gestion de Projet Agile',
            'domain': 'Management',
            'description': 'Méthodologies agiles, Scrum, gestion d\'équipes',
            'price': Decimal('199.99'),
            'profile': profiles[3]
        },
        {
            'title': 'Comptabilité et Finance d\'Entreprise',
            'domain': 'Finance',
            'description': 'Comptabilité générale, analyse financière, gestion de trésorerie',
            'price': Decimal('179.99'),
            'profile': profiles[4]
        },
        {
            'title': 'Stratégie Produit et Innovation',
            'domain': 'Marketing',
            'description': 'Méthodes de conception produit, recherche utilisateur, innovation',
            'price': Decimal('329.99'),
            'profile': profiles[5]
        },
        {
            'title': 'Conseil en Organisation et Transformation',
            'domain': 'Consulting',
            'description': 'Audit organisationnel, optimisation des processus, conduite du changement',
            'price': Decimal('359.99'),
            'profile': profiles[6]
        },
        {
            'title': 'Cybersécurité pour Entreprises',
            'domain': 'Sécurité',
            'description': 'Protection des systèmes, audit de sécurité, conformité RGPD',
            'price': Decimal('449.99'),
            'profile': profiles[7]
        }
    ]
    
    course_packs = []
    for data in course_packs_data:
        pack = CoursePack.objects.create(**data)
        course_packs.append(pack)
        
    print(f"✅ {len(course_packs)} packs de cours créés")
    return course_packs

def generate_chapters(course_packs):
    """Génère des chapitres pour chaque pack"""
    print("Génération des chapitres...")
    
    chapters_count = 0
    for pack in course_packs:
        # Générer entre 3 et 6 chapitres par pack
        chapter_count = random.randint(3, 6)
        for i in range(chapter_count):
            Chapter.objects.create(
                course_pack=pack,
                title=f'Chapitre {i+1}: {fake.catch_phrase()}',
                order=i+1,
                content_text=fake.text(max_nb_chars=500),
                video_url=fake.url()
            )
            chapters_count += 1
            
    print(f"✅ {chapters_count} chapitres créés")
    return chapters_count

def generate_quizzes(chapters):
    """Génère des quiz pour chaque chapitre"""
    print("Génération des quiz...")
    
    quiz_count = 0
    for chapter in Chapter.objects.all():
        quiz = Quiz.objects.create(
            chapter=chapter,
            passing_score=random.randint(12, 16)
        )
        
        # Générer 3-5 questions par quiz
        question_count = random.randint(3, 5)
        for i in range(question_count):
            question = QuizQuestion.objects.create(
                quiz=quiz,
                text=fake.sentence(nb_words=10),
                order=i+1,
                points=random.randint(1, 3)
            )
            
            # Générer 3-4 choix par question
            choice_count = random.randint(3, 4)
            for j in range(choice_count):
                QuizChoice.objects.create(
                    question=question,
                    text=fake.sentence(nb_words=8),
                    is_correct=(j == 0)  # Premier choix toujours correct
                )
        quiz_count += 1
        
    print(f"✅ {quiz_count} quiz créés")
    return quiz_count

def generate_job_offers(count=30):
    """Génère des offres d'emploi"""
    print(f"Génération de {count} offres d'emploi...")
    
    companies = [
        'TechCorp', 'DataSolutions', 'MarketingPro', 'InnovateLab', 'SecureNet',
        'WebCraft', 'AnalyticsCorp', 'CreativeAgency', 'ConsultingPlus', 'FinanceFlow'
    ]
    
    job_titles = [
        'Développeur Full-Stack', 'Data Scientist', 'Chef de Projet', 'Marketing Manager',
        'Consultant IT', 'Analyste Fonctionnel', 'UX/UI Designer', 'DevOps Engineer',
        'Product Manager', 'Spécialiste SEO', 'Community Manager', 'Business Analyst'
    ]
    
    for i in range(count):
        JobOffer.objects.create(
            title=random.choice(job_titles),
            company=random.choice(companies),
            location=fake.city(),
            description=fake.text(max_nb_chars=300),
            requirements=fake.text(max_nb_chars=200),
            salary_range=f"{random.randint(35000, 80000)}€ - {random.randint(45000, 120000)}€",
            application_url=fake.url(),
            posted_date=fake.date_between(start_date='-30d', end_date='today'),
            expiry_date=fake.date_between(start_date='+1d', end_date='+60d'),
            is_active=True
        )
        
    print(f"✅ {count} offres d'emploi créées")

def generate_competitions(count=15):
    """Génère des concours"""
    print(f"Génération de {count} concours...")
    
    competitions_data = [
        'Concours d\'Entrée en École d\'Ingénieurs', 'Concours de la Fonction Publique',
        'Hackathon Innovation Tech', 'Concours de Création d\'Entreprise',
        'Concours National de Mathématiques', 'Concours de Design UX/UI',
        'Concours de Réseaux Sociaux', 'Challenge Data Science',
        'Concours d\'Innovation Numérique', 'Concours de Marketing Digital'
    ]
    
    for i in range(count):
        Competition.objects.create(
            title=random.choice(competitions_data) + f" {i+1}",
            organizer=fake.company(),
            description=fake.text(max_nb_chars=300),
            eligibility=fake.text(max_nb_chars=200),
            registration_url=fake.url(),
            registration_deadline=fake.date_between(start_date='+1d', end_date='+90d'),
            exam_date=fake.date_between(start_date='+31d', end_date='+120d'),
            is_active=True
        )
        
    print(f"✅ {count} concours créés")

def generate_physical_centers(count=20):
    """Génère des centres physiques"""
    print(f"Génération de {count} centres physiques...")
    
    cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier']
    
    for i in range(count):
        PhysicalCenter.objects.create(
            name=f"Centre {fake.company()}",
            city=random.choice(cities),
            address=fake.address(),
            phone=fake.phone_number(),
            email=fake.email(),
            is_active=True
        )
        
    print(f"✅ {count} centres physiques créés")

def generate_faq_categories_and_faqs():
    """Génère des catégories et FAQ"""
    print("Génération des FAQ...")
    
    # Catégories
    categories_data = [
        {'name': 'Inscription et Connexion', 'order': 1},
        {'name': 'Formation et Cours', 'order': 2},
        {'name': 'Paiement et Facturation', 'order': 3},
        {'name': 'Certificat et Validation', 'order': 4},
        {'name': 'Support Technique', 'order': 5}
    ]
    
    categories = []
    for data in categories_data:
        category = FAQCategory.objects.create(**data)
        categories.append(category)
    
    # FAQ pour chaque catégorie
    faqs_data = [
        # Inscription
        {'category': categories[0], 'question': 'Comment créer un compte ?', 'answer': 'Cliquez sur "S\'inscrire" et remplissez le formulaire.', 'order': 1},
        {'category': categories[0], 'question': 'J\'ai oublié mon mot de passe', 'answer': 'Utilisez la fonction "Mot de passe oublié" sur la page de connexion.', 'order': 2},
        
        # Formation
        {'category': categories[1], 'question': 'Combien de temps pour terminer un cours ?', 'answer': 'Cela dépend du pack choisi, entre 2 et 6 mois généralement.', 'order': 1},
        {'category': categories[1], 'question': 'Puis-je estudiar à mon rythme ?', 'answer': 'Oui, tous nos cours sont accessibles 24h/24 et 7j/7.', 'order': 2},
        
        # Paiement
        {'category': categories[2], 'question': 'Quels sont les moyens de paiement acceptés ?', 'answer': 'Carte bancaire, PayPal, virement bancaire.', 'order': 1},
        {'category': categories[2], 'question': 'Y a-t-il une garantie satisfait ou remboursé ?', 'answer': 'Oui, 30 jours satisfait ou remboursé.', 'order': 2},
        
        # Certificat
        {'category': categories[3], 'question': 'Comment obtenir mon certificat ?', 'answer': 'Complétez tous les modules et réussissez le quiz final.', 'order': 1},
        {'category': categories[3], 'question': 'Le certificat est-il reconnu ?', 'answer': 'Nos certificats sont reconnus par les entreprises partenaires.', 'order': 2},
        
        # Support
        {'category': categories[4], 'question': 'Comment contacter le support ?', 'answer': 'Utilisez le chat en ligne ou envoyez un email à support@elite20.com', 'order': 1},
        {'category': categories[4], 'question': 'Les cours sont-ils compatibles mobile ?', 'answer': 'Oui, notre plateforme est responsive et optimisée mobile.', 'order': 2}
    ]
    
    for data in faqs_data:
        FAQ.objects.create(**data)
        
    print(f"✅ {len(categories)} catégories et {len(faqs_data)} FAQ créées")

def generate_referral_rewards(course_packs):
    """Génère des récompenses de parrainage"""
    print("Génération des récompenses de parrainage...")
    
    rewards_data = [
        {
            'name': 'Pack de cours gratuit (valeur 50€)',
            'reward_type': 'COURSE_PACK',
            'points_required': 100,
            'course_pack': course_packs[0] if course_packs else None
        },
        {
            'name': 'Pack de cours premium (valeur 100€)',
            'reward_type': 'COURSE_PACK',
            'points_required': 200,
            'course_pack': course_packs[1] if len(course_packs) > 1 else None
        },
        {
            'name': 'Bourse d\'études de 200€',
            'reward_type': 'SCHOLARSHIP',
            'points_required': 300,
            'scholarship_amount': Decimal('200.00')
        },
        {
            'name': 'Pack de cours expert (valeur 150€)',
            'reward_type': 'COURSE_PACK',
            'points_required': 250,
            'course_pack': course_packs[2] if len(course_packs) > 2 else None
        }
    ]
    
    for data in rewards_data:
        ReferralReward.objects.create(**data)
        
    print(f"✅ {len(rewards_data)} récompenses créées")

def generate_chat_messages(users, count=100):
    """Génère des messages de chat entre utilisateurs"""
    print(f"Génération de {count} messages de chat...")
    
    for i in range(count):
        sender = random.choice(users)
        recipient = random.choice([u for u in users if u != sender])
        
        ChatMessage.objects.create(
            sender=sender,
            recipient=recipient,
            message=fake.sentence(nb_words=random.randint(3, 15)),
            is_read=random.choice([True, False]),
            created_at=fake.date_time_between(start_date='-7d', end_date='now')
        )
        
    print(f"✅ {count} messages de chat créés")

def main():
    """Fonction principale"""
    print("🚀 Début de la génération de données de test pour Elite 2.0")
    print("=" * 60)
    
    # Nettoyer les données existantes
    print("🧹 Nettoyage des données existantes...")
    ChatMessage.objects.all().delete()
    ReferralRedemption.objects.all().delete()
    QuizAttempt.objects.all().delete()
    ChapterProgress.objects.all().delete()
    UserCoursePurchase.objects.all().delete()
    QuizChoice.objects.all().delete()
    QuizQuestion.objects.all().delete()
    Quiz.objects.all().delete()
    Chapter.objects.all().delete()
    CoursePack.objects.all().delete()
    UserPathValidation.objects.all().delete()
    AdaptivePath.objects.all().delete()
    UserMatchingResponse.objects.all().delete()
    MatchingAnswer.objects.all().delete()
    MatchingQuestion.objects.all().delete()
    FAQ.objects.all().delete()
    FAQCategory.objects.all().delete()
    Competition.objects.all().delete()
    JobOffer.objects.all().delete()
    PhysicalCenter.objects.all().delete()
    ReferralReward.objects.all().delete()
    Profile.objects.all().delete()
    User.objects.all().delete()
    
    print("✅ Données existantes supprimées")
    
    # Générer les données
    users = generate_users(50)
    profiles = generate_profiles()
    questions = generate_matching_questions()
    answers = generate_matching_answers(profiles, questions)
    course_packs = generate_course_packs(profiles)
    chapters_count = generate_chapters(course_packs)
    quiz_count = generate_quizzes(chapters_count)
    generate_job_offers(30)
    generate_competitions(15)
    generate_physical_centers(20)
    generate_faq_categories_and_faqs()
    generate_referral_rewards(course_packs)
    generate_chat_messages(users, 100)
    
    print("=" * 60)
    print("🎉 Génération terminée avec succès !")
    print(f"📊 Statistiques:")
    print(f"   - {User.objects.count()} utilisateurs")
    print(f"   - {Profile.objects.count()} profils")
    print(f"   - {CoursePack.objects.count()} packs de cours")
    print(f"   - {Chapter.objects.count()} chapitres")
    print(f"   - {JobOffer.objects.count()} offres d'emploi")
    print(f"   - {ChatMessage.objects.count()} messages de chat")
    print(f"   - {FAQ.objects.count()} questions FAQ")
    print("=" * 60)

if __name__ == '__main__':
    main()

