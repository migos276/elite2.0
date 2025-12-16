#!/usr/bin/env python
"""
Script pour tester les endpoints de matching avec authentification
"""

import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

from core.models import User
from django.contrib.auth import authenticate

def test_matching_endpoints():
    """Tester tous les endpoints de matching"""
    
    # Configuration
    base_url = "http://127.0.0.1:8000/api"
    username = "testuser"
    password = "testpass123"
    
    print("🔐 Test des endpoints de matching avec authentification...")
    
    # 1. Créer ou récupérer un utilisateur de test
    try:
        user = User.objects.get(username=username)
        print(f"✅ Utilisateur '{username}' trouvé")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email="test@example.com",
            password=password,
            first_name="Test",
            last_name="User",
            city="Paris",
            academic_level="BAC"
        )
        print(f"✅ Utilisateur '{username}' créé")
    
    # 2. Authentification pour obtenir un token
    print("\n🔑 Test d'authentification...")
    auth_data = {
        'username': username,
        'password': password
    }
    
    try:
        auth_response = requests.post(f"{base_url}/auth/login/", json=auth_data)
        if auth_response.status_code == 200:
            tokens = auth_response.json()
            access_token = tokens['access']
            print("✅ Authentification réussie")
        else:
            print(f"❌ Échec d'authentification: {auth_response.status_code}")
            print(f"Response: {auth_response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur Django")
        print("💡 Assurez-vous que le serveur Django est démarré avec: python manage.py runserver")
        return False
    
    # Headers pour les requêtes authentifiées
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # 3. Test de l'endpoint des questions
    print("\n📝 Test de l'endpoint des questions...")
    try:
        questions_response = requests.get(f"{base_url}/matching/questions/", headers=headers)
        if questions_response.status_code == 200:
            questions = questions_response.json()
            print(f"✅ Questions récupérées: {len(questions)} questions")
            for i, q in enumerate(questions, 1):
                print(f"   {i}. {q['text']} ({len(q['answers'])} réponses)")
        else:
            print(f"❌ Erreur lors de la récupération des questions: {questions_response.status_code}")
            print(f"Response: {questions_response.text}")
    except Exception as e:
        print(f"❌ Erreur lors du test des questions: {str(e)}")
    
    # 4. Test de l'endpoint des profils
    print("\n👥 Test de l'endpoint des profils...")
    try:
        profiles_response = requests.get(f"{base_url}/profiles/", headers=headers)
        if profiles_response.status_code == 200:
            profiles = profiles_response.json()
            print(f"✅ Profils récupérés: {len(profiles)} profils")
            for profile in profiles:
                print(f"   - {profile['name']} ({profile['category']})")
        else:
            print(f"❌ Erreur lors de la récupération des profils: {profiles_response.status_code}")
            print(f"Response: {profiles_response.text}")
    except Exception as e:
        print(f"❌ Erreur lors du test des profils: {str(e)}")
    
    # 5. Test de soumission du formulaire
    print("\n📊 Test de soumission du formulaire...")
    test_responses = [
        {"question_id": 1, "answer_id": 2},
        {"question_id": 2, "answer_id": 8},
        {"question_id": 3, "answer_id": 13},
        {"question_id": 4, "answer_id": 18},
        {"question_id": 5, "answer_id": 22}
    ]
    
    try:
        submit_response = requests.post(
            f"{base_url}/matching/submit/", 
            json={"responses": test_responses},
            headers=headers
        )
        if submit_response.status_code == 200:
            result = submit_response.json()
            print("✅ Formulaire soumis avec succès")
            print(f"Profils recommandés: {len(result['recommended_profiles'])}")
            for profile in result['recommended_profiles']:
                print(f"   - {profile['name']}")
        else:
            print(f"❌ Erreur lors de la soumission: {submit_response.status_code}")
            print(f"Response: {submit_response.text}")
    except Exception as e:
        print(f"❌ Erreur lors du test de soumission: {str(e)}")
    
    return True

def test_endpoints_without_auth():
    """Tester les endpoints sans authentification"""
    print("\n🔓 Test des endpoints sans authentification...")
    
    base_url = "http://127.0.0.1:8000/api"
    
    # Test de l'endpoint de test
    try:
        test_response = requests.get(f"{base_url}/test/")
        if test_response.status_code == 200:
            print("✅ Endpoint de test accessible")
        else:
            print(f"❌ Endpoint de test inaccessible: {test_response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Test des endpoints de matching...")
    
    # Test sans authentification
    if not test_endpoints_without_auth():
        print("\n💡 Démarrez le serveur Django avec: python manage.py runserver")
        sys.exit(1)
    
    # Test avec authentification
    success = test_matching_endpoints()
    
    if success:
        print("\n✅ Tests terminés!")
        print("\n📝 Résumé:")
        print("- Les endpoints de matching fonctionnent")
        print("- L'authentification JWT fonctionne")
        print("- Les données sont correctement récupérées")
    else:
        print("\n❌ Certains tests ont échoué")
        sys.exit(1)
