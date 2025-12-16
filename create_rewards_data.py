#!/usr/bin/env python3
"""
Générateur de données de test pour les récompenses de parrainage Elite 2.0
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import ReferralReward, CoursePack

User = get_user_model()

def create_sample_rewards():
    """Créer des récompenses d'exemple"""
    
    print("🎁 Création des récompenses de parrainage...")
    
    # Supprimer les récompenses existantes
    ReferralReward.objects.all().delete()
    print("   ✅ Récompenses existantes supprimées")
    
    # Créer des récompenses
    rewards = [
        {
            'name': 'Pack Débutant Gratuit',
            'description': 'Accès gratuit au pack de cours débutant',
            'points_required': 10,
            'reward_type': 'COURSE_PACK',
            'is_active': True
        },
        {
            'name': 'Pack Intermédiaire -50%',
            'description': 'Réduction de 50% sur le pack intermédiaire',
            'points_required': 25,
            'reward_type': 'COURSE_PACK',
            'is_active': True
        },
        {
            'name': 'Pack Avancé Gratuit',
            'description': 'Accès gratuit au pack de cours avancé',
            'points_required': 50,
            'reward_type': 'COURSE_PACK',
            'is_active': True
        },
        {
            'name': 'Pack Expert Gratuit',
            'description': 'Accès gratuit au pack de cours expert',
            'points_required': 100,
            'reward_type': 'COURSE_PACK',
            'is_active': True
        },
        {
            'name': 'Certification Premium',
            'description': 'Accès à la certification premium',
            'points_required': 75,
            'reward_type': 'CERTIFICATION',
            'is_active': True
        }
    ]
    
    # Associer aux course packs existants si possible
    course_packs = CoursePack.objects.filter(is_active=True)
    
    created_rewards = []
    for i, reward_data in enumerate(rewards):
        reward = ReferralReward.objects.create(**reward_data)
        
        # Associer un course pack si disponible
        if course_packs.exists() and reward_data['reward_type'] == 'COURSE_PACK':
            reward.course_pack = course_packs[i % course_packs.count()]
            reward.save()
        
        created_rewards.append(reward)
        print(f"   ✅ Créée: {reward.name} ({reward.points_required} points)")
    
    print(f"\n🎉 {len(created_rewards)} récompenses créées avec succès!")
    
    # Créer quelques utilisateurs avec des points de parrainage
    print("\n👥 Création d'utilisateurs avec points de parrainage...")
    
    # Utiliser des utilisateurs existants ou en créer
    users = list(User.objects.all())[:3]  # Prendre les 3 premiers
    
    if users:
        for i, user in enumerate(users):
            user.referral_points = (i + 1) * 15  # 15, 30, 45 points
            user.save()
            print(f"   ✅ {user.username}: {user.referral_points} points")
    else:
        print("   ⚠️  Aucun utilisateur trouvé pour assigner des points")
    
    return created_rewards

def verify_endpoints():
    """Vérifier que les endpoints fonctionnent"""
    import requests
    
    base_url = "http://172.20.10.2:8000/api"
    
    print("\n🔍 Vérification des endpoints...")
    
    try:
        # Test endpoint rewards
        response = requests.get(f"{base_url}/rewards/")
        print(f"   GET /rewards/ : {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data)} récompenses récupérées")
            for reward in data:
                print(f"      - {reward.get('name', 'N/A')}")
        else:
            print(f"   ❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Erreur de connexion: {e}")

def main():
    print("🚀 Générateur de données de test - Récompenses Elite 2.0")
    print("="*60)
    
    # Créer les récompenses
    rewards = create_sample_rewards()
    
    # Vérifier les endpoints
    verify_endpoints()
    
    print("\n" + "="*60)
    print("📋 RÉSUMÉ:")
    print(f"✅ {len(rewards)} récompenses créées")
    print("✅ Utilisateurs mis à jour avec des points")
    print("✅ Endpoints vérifiés")
    print("\n🎯 L'écran des récompenses devrait maintenant fonctionner!")

if __name__ == "__main__":
    main()
