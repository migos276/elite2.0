import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatMessage

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.other_user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_name = f'chat_{min(self.user.id, self.other_user_id)}_{max(self.user.id, self.other_user_id)}'
        self.room_group_name = f'chat_{self.room_name}'
        
        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        
        # Sauvegarder le message
        await self.save_message(self.user.id, self.other_user_id, message)
        
        # Envoyer le message au groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.user.id,
                'sender_name': self.user.username,
            }
        )
    
    async def chat_message(self, event):
        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
        }))
    
    @database_sync_to_async
    def save_message(self, sender_id, recipient_id, message):
        sender = User.objects.get(id=sender_id)
        recipient = User.objects.get(id=recipient_id)
        ChatMessage.objects.create(
            sender=sender,
            recipient=recipient,
            message=message
        )
