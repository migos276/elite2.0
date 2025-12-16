#!/usr/bin/env python3
"""
Test des endpoints FAQ pour vérifier que l'erreur 404 est corrigée
"""

import requests
import json
import os
import sys
from django.core.management import execute_from_command_line

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
sys.path.append('/home/migos/Bureau/20k/Nouveau dossier/elite20backend')

import django
django.setup()

from django.contrib.auth import get_user_model
from core.models import FAQ, FAQCategory
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def create_faq_data():
    """Créer des données FAQ de test"""
    print("🔧 Création des données FAQ...")
    

    # Créer les catégories FAQ si elles n'existent pas
    general_cat, _ = FAQCategory.objects.get_or_create(
        name="Général",
        defaults={'order': 1}
    )
    
    courses_cat, _ = FAQCategory.objects.get_or_create(
        name="Cours",
        defaults={'order': 2}
    )
    
    payment_cat, _ = FAQCategory.objects.get_or_create(
        name="Paiement",
        defaults={'order': 3}
    )
    
    # Créer des FAQs si elles n'existent pas
    faqs_data = [
        {
            'category': general_cat,
            'question': 'Qu\'est-ce qu\'Elite 2.0 ?',
            'answer': 'Elite 2.0 est une plateforme de formation en ligne qui propose des cours adaptatifs, des quiz interactifs et un système de parrainage pour faciliter l\'apprentissage.',
            'is_active': True
        },
        {
            'category': courses_cat,
            'question': 'Comment accéder aux cours ?',
            'answer': 'Pour accéder aux cours, vous devez d\'abord compléter le processus de matching pour sélectionner votre profil, puis acheter les packs de cours qui vous intéressent.',
            'is_active': True
        },
        {
            'category': courses_cat,
            'question': 'Que se passe-t-il si je rate un quiz ?',
            'answer': 'Si vous ratez un quiz, vous pouvez soit le recommencer, soit utiliser l\'option de parrainage en parrainant 4 membres pour débloquer le chapitre suivant.',
            'is_active': True
        },
        {
            'category': payment_cat,
            'question': 'Quels sont les moyens de paiement acceptés ?',
            'answer': 'Nous acceptons les paiements par carte bancaire, mobile money, et vous pouvez également utiliser vos points de parrainage pour obtenir des cours gratuits.',
            'is_active': True
        },
        {
            'category': general_cat,
            'question': 'Comment fonctionne le système de parrainage ?',
            'answer': 'Le système de parrainage vous permet de gagner des points pour chaque ami parrainé. Ces points peuvent être échangés contre des cours gratuits ou des récompenses.',
            'is_active': True
        }
    ]
    
    created_count = 0
    for faq_data in faqs_data:
        faq, created = FAQ.objects.get_or_create(
            question=faq_data['question'],
            defaults=faq_data
        )
        if created:
            created_count += 1
    
    print(f"✅ {created_count} nouvelles FAQ créées")
    return True

def get_user_token():
    """Obtenir un token JWT pour un utilisateur de test"""
    try:
        # Créer un utilisateur de test s'il n'existe pas
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@elite2.0',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            print("👤 Utilisateur de test créé")
        
        # Obtenir le token
        refresh = RefreshToken.for_user(test_user)
        return str(refresh.access_token)
        
    except Exception as e:
        print(f"❌ Erreur lors de la création du token: {e}")
        return None

def test_faq_endpoints():
    """Tester les endpoints FAQ"""
    print("\n🧪 Test des endpoints FAQ...")
    
    # Obtenir le token
    token = get_user_token()
    if not token:
        print("❌ Impossible d'obtenir un token")
        return False
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    base_url = 'http://localhost:8000'
    

    # Test 1: Endpoint FAQ avec slash final
    print("\n📡 Test 1: GET /api/faq/")
    try:
        response = requests.get(f"{base_url}/api/faq/", headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ SUCCESS - Endpoint /api/faq/ fonctionne")
            data = response.json()
            print(f"   📊 Nombre de FAQs: {len(data)}")
            if data:
                print(f"   📝 Première question: {data[0].get('question', 'N/A')[:50]}...")
        else:
            print(f"   ❌ FAILED - Status: {response.status_code}")
            print(f"   📄 Réponse: {response.text[:200]}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test 2: Endpoint FAQ avec 's'
    print("\n📡 Test 2: GET /api/faqs/")
    try:
        response = requests.get(f"{base_url}/api/faqs/", headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ SUCCESS - Endpoint /api/faqs/ fonctionne")
            data = response.json()
            print(f"   📊 Nombre de FAQs: {len(data)}")
        else:
            print(f"   ❌ FAILED - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    # Test 3: Endpoint IA FAQ
    print("\n📡 Test 3: POST /api/faq/ask/")
    try:
        response = requests.post(
            f"{base_url}/api/faq/ask/", 
            headers=headers, 
            json={'question': 'Comment fonctionne Elite 2.0 ?'},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ SUCCESS - Endpoint IA fonctionne")
        else:
            print(f"   ❌ FAILED - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erreur de connexion: {e}")
    
    return True

def main():
    """Fonction principale"""
    print("🚀 Test de correction de l'erreur 404 /faq/")
    print("=" * 50)
    
    # Créer les données
    if not create_faq_data():
        print("❌ Échec de la création des données FAQ")
        return
    
    # Tester les endpoints
    test_faq_endpoints()
    
    print("\n" + "=" * 50)
    print("✅ Test terminé")

if __name__ == "__main__":
    main()
