#!/usr/bin/env python3
"""
Script de test pour diagnostiquer les erreurs 404 des endpoints /rewards/
"""

import requests
import json

BASE_URL = "http://172.20.10.2:8000"
API_BASE = f"{BASE_URL}/api"

def test_endpoint(endpoint, method="GET", data=None):
    """Test un endpoint spécifique"""
    url = f"{API_BASE}{endpoint}"
    print(f"\n🧪 Test {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        else:
            response = requests.request(method, url, json=data)
            
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        return response.status_code
        
    except Exception as e:
        print(f"   Error: {e}")
        return None

def main():
    print("🔍 Diagnostic des endpoints Elite 2.0")
    print("="*50)
    
    # Test de connexion de base
    print("\n1. Test de connexion:")
    test_endpoint("/test/")
    
    # Test des endpoints rewards
    print("\n2. Test des endpoints rewards:")
    test_endpoint("/rewards/")
    test_endpoint("/rewards/1/redeem/", method="POST", data={})
    
    # Test d'autres endpoints qui fonctionnent
    print("\n3. Test d'autres endpoints (pour comparaison):")
    test_endpoint("/referrals/stats/")
    test_endpoint("/courses/")
    
    # Test de la structure du router
    print("\n4. Test de la structure des routes:")
    test_endpoint("/")
    
    # Recommandations
    print("\n" + "="*50)
    print("📋 DIAGNOSTIC:")
    print("Si les endpoints /rewards/ retournent 404:")
    print("1. Vérifier que ReferralRewardViewSet est bien registrado")
    print("2. Vérifier les permissions (IsAuthenticated)")
    print("3. Vérifier qu'il y a des données dans la base")
    print("4. Vérifier l'URL complète utilisée par le frontend")

if __name__ == "__main__":
    main()
