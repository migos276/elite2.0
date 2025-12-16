#!/usr/bin/env python
"""
Script to create test messages for the testuser
This will help resolve the "can't see messages" issue
"""

import os
import django
import random
from datetime import datetime, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
django.setup()

from core.models import ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

def create_test_messages():
    """Create test messages for testuser"""
    print("🚀 Creating test messages for testuser...")
    
    try:
        # Get or create testuser
        testuser, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
            }
        )
        
        if created:
            testuser.set_password('password123')
            testuser.save()
            print("✅ Created testuser with password: password123")
        else:
            print("✅ testuser already exists")
        
        # Create some chat partners if they don't exist
        partners = []
        partner_names = ['alice', 'bob', 'charlie', 'diana', 'eve']
        
        for name in partner_names:
            partner, created = User.objects.get_or_create(
                username=name,
                defaults={
                    'email': f'{name}@example.com',
                    'first_name': name.capitalize(),
                    'last_name': 'Test',
                }
            )
            if created:
                partner.set_password('password123')
                partner.save()
                print(f"✅ Created partner: {name}")
            partners.append(partner)
        
        # Sample messages
        messages = [
            "Salut ! Comment ça va ?",
            "Tu as vu la nouvelle formation ?",
            "Je recommande ce cours !",
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
            "Les vidéos sont très claires",
            "Quel pack de cours recommandes-tu ?",
            "J'ai besoin d'aide pour le paiement",
            "Excellent travail sur ce projet !"
        ]
        
        # Create conversations between testuser and each partner
        conversation_count = 0
        message_count = 0
        
        for partner in partners:
            print(f"\n💬 Creating conversation between testuser and {partner.username}...")
            
            # Create 5-8 messages per conversation
            num_messages = random.randint(5, 8)
            
            for i in range(num_messages):
                # Alternate who sends the message
                if i % 2 == 0:
                    sender = testuser
                    recipient = partner
                else:
                    sender = partner
                    recipient = testuser
                
                message_text = random.choice(messages)
                
                # Create the message
                ChatMessage.objects.create(
                    sender=sender,
                    recipient=recipient,
                    message=message_text,
                    is_read=random.choice([True, False]),
                    created_at=datetime.now() - timedelta(hours=random.randint(1, 72))
                )
                message_count += 1
            
            conversation_count += 1
            print(f"✅ Created {num_messages} messages with {partner.username}")
        
        # Create a few group conversations or additional messages
        print(f"\n📝 Creating additional individual messages...")
        
        for i in range(10):
            partner = random.choice(partners)
            sender = random.choice([testuser, partner])
            recipient = partner if sender == testuser else testuser
            
            ChatMessage.objects.create(
                sender=sender,
                recipient=recipient,
                message=random.choice(messages),
                is_read=random.choice([True, False]),
                created_at=datetime.now() - timedelta(hours=random.randint(1, 48))
            )
            message_count += 1
        
        print(f"\n🎉 SUCCESS!")
        print(f"📊 Summary:")
        print(f"   - Created {conversation_count} conversations")
        print(f"   - Created {message_count} total messages")
        print(f"   - Partners: {', '.join([p.username for p in partners])}")
        
        # Show sample messages
        print(f"\n📱 Sample messages for testuser:")
        sample_messages = ChatMessage.objects.filter(
            sender=testuser
        ) | ChatMessage.objects.filter(
            recipient=testuser
        )[:5]
        
        for msg in sample_messages:
            direction = "→" if msg.sender == testuser else "←"
            print(f"   {direction} {msg.sender.username} {direction} {msg.recipient.username}: {msg.message[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_messages():
    """Verify the messages were created correctly"""
    print("\n🔍 Verifying messages...")
    
    try:
        testuser = User.objects.get(username='testuser')
        
        # Count messages involving testuser
        sent_messages = ChatMessage.objects.filter(sender=testuser).count()
        received_messages = ChatMessage.objects.filter(recipient=testuser).count()
        total_messages = sent_messages + received_messages
        
        print(f"📊 testuser message statistics:")
        print(f"   - Sent messages: {sent_messages}")
        print(f"   - Received messages: {received_messages}")
        print(f"   - Total messages: {total_messages}")
        
        # Show unique conversations
        conversations = ChatMessage.objects.filter(
            sender=testuser
        ).values('recipient__username').distinct().count()
        
        conversations += ChatMessage.objects.filter(
            recipient=testuser
        ).values('sender__username').distinct().count()
        
        print(f"   - Unique conversations: {conversations}")
        
        return total_messages > 0
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Starting test message creation...")
    print("=" * 50)
    
    success = create_test_messages()
    
    if success:
        verify_messages()
        print("\n✅ Test message creation completed successfully!")
        print("\n💡 Next steps:")
        print("   1. Open your mobile app")
        print("   2. Login with: testuser / password123")
        print("   3. Go to Chat section")
        print("   4. You should now see conversations with alice, bob, charlie, diana, eve")
    else:
        print("\n❌ Failed to create test messages")
    
    print("=" * 50)
