#!/usr/bin/env python
"""
Script pour générer les données de test pour le formulaire de correspondance
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

from core.models import MatchingQuestion, MatchingAnswer, Profile, User

def create_matching_questions():
    """Créer les questions de correspondance avec leurs réponses"""
    
    # Supprimer les anciennes données
    MatchingAnswer.objects.all().delete()
    MatchingQuestion.objects.all().delete()
    
    # Créer des profils de base si ils n'existent pas
    profiles_data = [
        {
            'name': 'Développeur Web',
            'description': 'Formation complète en développement web et mobile',
            'category': 'Informatique',
        },
        {
            'name': 'Marketing Digital',
            'description': 'Formation en marketing digital et e-commerce',
            'category': 'Commerce',
        },
        {
            'name': 'Ingénierie Logicielle',
            'description': 'Formation en génie logiciel et systèmes',
            'category': 'Ingénierie',
        },
        {
            'name': 'Commerce International',
            'description': 'Formation en commerce international et logistique',
            'category': 'Commerce',
        },
        {
            'name': 'Cybersécurité',
            'description': 'Formation spécialisée en sécurité informatique',
            'category': 'Informatique',
        },
        {
            'name': 'Génie Civil',
            'description': 'Formation en construction et BTP',
            'category': 'Ingénierie',
        }
    ]
    
    profiles = {}
    for profile_data in profiles_data:
        profile, created = Profile.objects.get_or_create(
            name=profile_data['name'],
            defaults={
                'description': profile_data['description'],
                'category': profile_data['category'],
                'is_active': True
            }
        )
        profiles[profile_data['name']] = profile
    
    # Questions de correspondance
    questions_data = [
        {
            'text': 'Quel est votre niveau d\'études actuel ?',
            'order': 1,
            'answers': [
                {
                    'text': 'BEPC (Brevet d\'Études du Premier Cycle)',
                    'weights': {
                        str(profiles['Développeur Web'].id): 3,
                        str(profiles['Marketing Digital'].id): 4,
                        str(profiles['Commerce International'].id): 5,
                    }
                },
                {
                    'text': 'BAC (Baccalauréat)',
                    'weights': {
                        str(profiles['Développeur Web'].id): 5,
                        str(profiles['Marketing Digital'].id): 5,
                        str(profiles['Ingénierie Logicielle'].id): 4,
                        str(profiles['Commerce International'].id): 4,
                    }
                },
                {
                    'text': 'Bac+1 ou Bac+2 (BTS/DUT)',
                    'weights': {
                        str(profiles['Développeur Web'].id): 5,
                        str(profiles['Marketing Digital'].id): 4,
                        str(profiles['Ingénierie Logicielle'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                        str(profiles['Commerce International'].id): 4,
                    }
                },
                {
                    'text': 'Licence (Bac+3) ou plus',
                    'weights': {
                        str(profiles['Ingénierie Logicielle'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                        str(profiles['Génie Civil'].id): 5,
                        str(profiles['Développeur Web'].id): 4,
                    }
                }
            ]
        },
        {
            'text': 'Quel domaine vous intéresse le plus ?',
            'order': 2,
            'answers': [
                {
                    'text': 'Informatique et Technologies',
                    'weights': {
                        str(profiles['Développeur Web'].id): 5,
                        str(profiles['Ingénierie Logicielle'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                    }
                },
                {
                    'text': 'Commerce et Marketing',
                    'weights': {
                        str(profiles['Marketing Digital'].id): 5,
                        str(profiles['Commerce International'].id): 5,
                    }
                },
                {
                    'text': 'Ingénierie et BTP',
                    'weights': {
                        str(profiles['Génie Civil'].id): 5,
                        str(profiles['Ingénierie Logicielle'].id): 4,
                    }
                },
                {
                    'text': 'Management et Administration',
                    'weights': {
                        str(profiles['Marketing Digital'].id): 3,
                        str(profiles['Commerce International'].id): 4,
                    }
                }
            ]
        },
        {
            'text': 'Quel type de formation préférez-vous ?',
            'order': 3,
            'answers': [
                {
                    'text': 'Formation en ligne (100% digitale)',
                    'weights': {
                        str(profiles['Développeur Web'].id): 5,
                        str(profiles['Marketing Digital'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                    }
                },
                {
                    'text': 'Formation mixte (en ligne + présentiel)',
                    'weights': {
                        str(profiles['Ingénierie Logicielle'].id): 4,
                        str(profiles['Commerce International'].id): 4,
                        str(profiles['Génie Civil'].id): 3,
                    }
                },
                {
                    'text': 'Formation 100% en centre',
                    'weights': {
                        str(profiles['Génie Civil'].id): 5,
                        str(profiles['Commerce International'].id): 3,
                    }
                }
            ]
        },
        {
            'text': 'Combien de temps pouvez-vous consacrer à votre formation par semaine ?',
            'order': 4,
            'answers': [
                {
                    'text': 'Moins de 5 heures',
                    'weights': {
                        str(profiles['Marketing Digital'].id): 3,
                        str(profiles['Commerce International'].id): 3,
                    }
                },
                {
                    'text': '5 à 10 heures',
                    'weights': {
                        str(profiles['Développeur Web'].id): 4,
                        str(profiles['Marketing Digital'].id): 4,
                        str(profiles['Commerce International'].id): 4,
                    }
                },
                {
                    'text': '10 à 15 heures',
                    'weights': {
                        str(profiles['Développeur Web'].id): 5,
                        str(profiles['Ingénierie Logicielle'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                    }
                },
                {
                    'text': 'Plus de 15 heures',
                    'weights': {
                        str(profiles['Ingénierie Logicielle'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                        str(profiles['Génie Civil'].id): 5,
                    }
                }
            ]
        },
        {
            'text': 'Quel est votre objectif principal ?',
            'order': 5,
            'answers': [
                {
                    'text': 'Trouver un emploi rapidement',
                    'weights': {
                        str(profiles['Développeur Web'].id): 5,
                        str(profiles['Marketing Digital'].id): 5,
                        str(profiles['Commerce International'].id): 4,
                    }
                },
                {
                    'text': 'Créer ma propre entreprise',
                    'weights': {
                        str(profiles['Marketing Digital'].id): 4,
                        str(profiles['Commerce International'].id): 5,
                        str(profiles['Développeur Web'].id): 4,
                    }
                },
                {
                    'text': 'Évoluer dans mon domaine actuel',
                    'weights': {
                        str(profiles['Ingénierie Logicielle'].id): 4,
                        str(profiles['Cybersécurité'].id): 4,
                        str(profiles['Génie Civil'].id): 4,
                    }
                },
                {
                    'text': 'Obtenir une certification reconnue',
                    'weights': {
                        str(profiles['Ingénierie Logicielle'].id): 5,
                        str(profiles['Cybersécurité'].id): 5,
                        str(profiles['Génie Civil'].id): 5,
                    }
                }
            ]
        }
    ]
    
    # Créer les questions et réponses
    created_questions = []
    for question_data in questions_data:
        question = MatchingQuestion.objects.create(
            text=question_data['text'],
            order=question_data['order'],
            is_active=True
        )
        created_questions.append(question)
        
        for answer_data in question_data['answers']:
            MatchingAnswer.objects.create(
                question=question,
                text=answer_data['text'],
                profile_weights=answer_data['weights']
            )
    
    print(f"✅ {len(created_questions)} questions de correspondance créées avec succès!")
    print("\nQuestions créées:")
    for i, question in enumerate(created_questions, 1):
        print(f"{i}. {question.text}")
    
    return created_questions

def test_api_endpoint():
    """Tester l'endpoint des questions"""
    from django.test import Client
    from django.contrib.auth.models import AnonymousUser
    
    client = Client()
    
    # Test sans authentification
    response = client.get('/api/matching/questions/')
    print(f"\n🔍 Test endpoint sans authentification:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Note: Pour tester avec authentification, il faudrait créer un utilisateur et obtenir un token
    print("\n💡 Note: Testez avec un utilisateur authentifié pour vérifier l'accès complet")

if __name__ == "__main__":
    print("🚀 Génération des données de test pour le formulaire de correspondance...")
    
    try:
        questions = create_matching_questions()
        test_api_endpoint()
        
        print("\n✅ Génération terminée avec succès!")
        print("\n📝 Instructions:")
        print("1. Redémarrez le serveur Django")
        print("2. Connectez-vous avec un utilisateur")
        print("3. Accédez au formulaire de correspondance")
        print("4. Les questions devraient maintenant s'afficher")
        
    except Exception as e:
        print(f"❌ Erreur lors de la génération: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
