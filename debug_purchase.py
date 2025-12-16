#!/usr/bin/env python3
"""
Diagnostic rapide pour identifier pourquoi les progressions ne sont pas créées lors de l'achat
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import *

User = get_user_model()

def debug_purchase_logic():
    """Debug de la logique d'achat"""
    print("🔍 Diagnostic de la logique d'achat")
    print("="*50)
    
    # Récupérer l'utilisateur test
    user = User.objects.get(username='test_user_chapters')
    course_pack = CoursePack.objects.get(title='Test Course Pack')
    
    print(f"👤 Utilisateur: {user.username}")
    print(f"📦 Pack de cours: {course_pack.title}")
    
    # Vérifier si l'achat existe déjà
    purchase_exists = UserCoursePurchase.objects.filter(user=user, course_pack=course_pack).exists()
    print(f"🛒 Achat existant: {purchase_exists}")
    
    # Vérifier les chapitres
    chapters = course_pack.chapters.all().order_by('order')
    print(f"📖 Nombre de chapitres: {chapters.count()}")
    
    for chapter in chapters:
        progress_exists = ChapterProgress.objects.filter(user=user, chapter=chapter).exists()
        print(f"   📝 Chapitre {chapter.order}: {chapter.title} - Progression: {'✅' if progress_exists else '❌'}")
    
    # Simuler l'achat (créer une nouvelle instance)
    print(f"\n🔄 Test de la logique d'achat:")
    
    # Créer un nouvel utilisateur pour test propre
    test_user, created = User.objects.get_or_create(
        username='debug_purchase_user',
        defaults={
            'email': 'debug@example.com',
            'first_name': 'Debug',
            'last_name': 'User'
        }
    )
    
    if created:
        test_user.set_password('debug123')
        test_user.save()
        print(f"   ✅ Nouvel utilisateur créé: {test_user.username}")
    else:
        print(f"   🔄 Utilisateur existant utilisé: {test_user.username}")
    
    # Supprimer anciens achats pour ce test
    UserCoursePurchase.objects.filter(user=test_user, course_pack=course_pack).delete()
    ChapterProgress.objects.filter(user=test_user, chapter__course_pack=course_pack).delete()
    
    print(f"   🗑️  Anciens achats et progressions supprimés")
    
    # Simuler la création de l'achat
    print(f"   🛒 Création de l'achat...")
    purchase = UserCoursePurchase.objects.create(
        user=test_user,
        course_pack=course_pack,
        payment_method='DEBUG',
        amount_paid=course_pack.price
    )
    
    print(f"   ✅ Achat créé avec ID: {purchase.id}")
    
    # Simuler la création des progressions (logique de la méthode purchase)
    print(f"   📝 Création des progressions...")
    chapters = course_pack.chapters.all().order_by('order')
    created_progress = 0
    
    for index, chapter in enumerate(chapters):
        status = 'IN_PROGRESS' if index == 0 else 'LOCKED'
        
        progress, created = ChapterProgress.objects.get_or_create(
            user=test_user,
            chapter=chapter,
            defaults={'status': status}
        )
        
        if created:
            created_progress += 1
            print(f"      ✅ Chapitre {chapter.order}: {chapter.title} - Créé ({status})")
        else:
            print(f"      🔄 Chapitre {chapter.order}: {chapter.title} - Déjà existant")
    
    print(f"\n📊 RÉSULTAT:")
    print(f"   📈 Progressions créées: {created_progress}")
    print(f"   📖 Total chapitres: {chapters.count()}")
    
    if created_progress == chapters.count():
        print(f"   ✅ SUCCÈS: Toutes les progressions ont été créées")
    else:
        print(f"   ❌ ÉCHEC: Progressions manquantes")
    
    # Vérification finale
    final_count = ChapterProgress.objects.filter(user=test_user, chapter__course_pack=course_pack).count()
    print(f"   📊 Comptage final: {final_count} progressions")

if __name__ == "__main__":
    debug_purchase_logic()
