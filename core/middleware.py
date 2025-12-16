from django.shortcuts import redirect
from django.urls import reverse
from django.http import JsonResponse

class MatchingFormMiddleware:
    """Middleware pour bloquer l'accès tant que le formulaire de correspondance n'est pas complété"""
    
    EXEMPT_URLS = [
        '/api/auth/',
        '/api/register/',
        '/api/matching/',
        '/api/profiles/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Vérifier si l'URL est exemptée
        if any(request.path.startswith(url) for url in self.EXEMPT_URLS):
            return self.get_response(request)
        
        # Vérifier si l'utilisateur est authentifié
        if request.user.is_authenticated:
            # Vérifier si le formulaire de correspondance est complété
            if not request.user.has_completed_matching and not request.path.startswith('/api/matching/'):
                return JsonResponse(
                    {'error': 'Vous devez compléter le formulaire de correspondance avant d\'accéder à cette ressource'},
                    status=403
                )
        
        return self.get_response(request)
