#!/usr/bin/env python
"""
Script pour créer un utilisateur de test et tester le formulaire de correspondance
"""

import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

def create_test_user():
    """Créer un utilisateur de test"""
    
    username = "testuser"
    email = "test@example.com"
    password = "testpass123"
    
    try:
        user = User.objects.get(username=username)
        print(f"✅ Utilisateur '{username}' existe déjà")
        return user
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name="Test",
            last_name="User",
            city="Paris",
            academic_level="BAC"
        )
        print(f"✅ Utilisateur '{username}' créé avec succès")
        return user

def get_auth_token(username, password):
    """Obtenir un token d'authentification"""
    
    url = f"http://localhost:8000/api/auth/login/"
    data = {
        'username': username,
        'password': password
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            tokens = response.json()
            return tokens['access']
        else:
            print(f"❌ Erreur de connexion: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return None


def test_matching_questions(token):
    """Tester l'endpoint des questions avec authentification"""
    
    url = "http://localhost:8000/api/matching/questions/"
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\n🔍 Test endpoint questions avec authentification:")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                questions = response.json()
                print(f"✅ Réponse reçue!")
                print(f"Type de réponse: {type(questions)}")
                
                # Si c'est une liste
                if isinstance(questions, list):
                    print(f"✅ {len(questions)} questions trouvées!")
                    
                    for i, q in enumerate(questions, 1):
                        if isinstance(q, dict) and 'text' in q:
                            print(f"{i}. {q['text']}")
                            print(f"   Réponses: {len(q.get('answers', []))}")
                        else:
                            print(f"{i}. Question: {q}")
                    
                    return questions
                else:
                    print(f"Réponse: {questions}")
                    return questions
                    
            except json.JSONDecodeError:
                print(f"❌ Réponse non JSON: {response.text}")
                return None
        else:
            print(f"❌ Erreur: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {str(e)}")
        return None

def test_matching_submission(token):
    """Tester la soumission du formulaire"""
    
    # Préparer des réponses de test
    test_responses = [
        {
            'question_id': 1,
            'answer_id': 3  # BAC
        },
        {
            'question_id': 2,
            'answer_id': 5  # Informatique
        },
        {
            'question_id': 3,
            'answer_id': 9  # Formation en ligne
        },
        {
            'question_id': 4,
            'answer_id': 13  # 10-15h/semaine
        },
        {
            'question_id': 5,
            'answer_id': 17  # Trouver un emploi
        }
    ]
    
    url = "http://localhost:8000/api/matching/submit/"
    headers = {
        'Authorization': f'Bearer {token}'
    }
    data = {
        'responses': test_responses
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\n🔍 Test soumission formulaire:")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Soumission réussie!")
            print(f"Message: {result.get('message', '')}")
            
            profiles = result.get('recommended_profiles', [])
            print(f"Profils recommandés: {len(profiles)}")
            
            for profile in profiles:
                print(f"- {profile.get('name', 'N/A')} ({profile.get('category', 'N/A')})")
            
            return True
        else:
            print(f"❌ Erreur: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {str(e)}")
        return False

def check_server_status():
    """Vérifier si le serveur Django fonctionne"""
    
    try:
        response = requests.get("http://localhost:8000/api/test/", timeout=5)
        if response.status_code == 200:
            print("✅ Serveur Django fonctionne")
            return True
        else:
            print(f"⚠️  Serveur répond avec status: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Serveur Django ne répond pas")
        print("💡 Démarrez le serveur avec: python manage.py runserver")
        return False

if __name__ == "__main__":
    print("🚀 Test du formulaire de correspondance...")
    
    # Vérifier le serveur
    if not check_server_status():
        sys.exit(1)
    
    # Créer un utilisateur de test
    user = create_test_user()
    
    # Obtenir un token
    print("\n🔐 Authentification...")
    token = get_auth_token("testuser", "testpass123")
    
    if not token:
        print("❌ Impossible d'obtenir le token d'authentification")
        sys.exit(1)
    
    # Tester les questions
    questions = test_matching_questions(token)
    
    if questions:
        # Tester la soumission
        test_matching_submission(token)
    
    print("\n✅ Test terminé!")
    print("\n📱 Pour tester l'application mobile:")
    print("1. Démarrez l'app React Native")
    print("2. Connectez-vous avec: testuser / testpass123")
    print("3. Accédez au formulaire de correspondance")
    print("4. Les questions devraient maintenant s'afficher")
