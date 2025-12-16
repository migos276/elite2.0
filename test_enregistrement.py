#!/usr/bin/env python3
"""
Script de test pour valider le processus d'enregistrement Elite 2.0
Teste le flux complet d'inscription avec validation et gestion d'erreurs
"""

import requests
import json
from datetime import datetime
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

class RegistrationTester:
    def __init__(self):
        self.session = requests.Session()
        self.results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Enregistre les résultats des tests"""
        result = {
            "timestamp": datetime.now().isoformat(),
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Détails: {details}")
    
    def test_connection(self):
        """Test de connexion à l'API"""
        try:
            response = self.session.get(f"{API_URL}/test/")
            if response.status_code == 200:
                self.log_test("Connexion API", True, "API accessible")
                return True
            else:
                self.log_test("Connexion API", False, f"Code statut: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Connexion API", False, f"Erreur: {str(e)}")
            return False
    
    def test_valid_registration(self):
        """Test d'inscription avec données valides"""
        user_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+33123456789",
            "city": "Paris",
            "academic_level": "BAC",
            "referral_code_used": ""
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/register/", json=user_data)
            
            if response.status_code == 201:
                self.log_test("Inscription valide", True, "Utilisateur créé avec succès", 
                            f"Username: {user_data['username']}")
                return user_data
            else:
                self.log_test("Inscription valide", False, 
                            f"Code statut: {response.status_code}, Réponse: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Inscription valide", False, f"Erreur: {str(e)}")
            return None
    
    def test_invalid_email(self):
        """Test avec email invalide"""
        user_data = {
            "username": f"testuser_{int(time.time())}",
            "email": "invalid-email",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+33123456789",
            "city": "Paris",
            "academic_level": "BAC",
            "referral_code_used": ""
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/register/", json=user_data)
            
            if response.status_code == 400:
                data = response.json()
                if "email" in data:
                    self.log_test("Email invalide", True, "Erreur de validation détectée", data)
                else:
                    self.log_test("Email invalide", False, "Erreur non détectée", data)
            else:
                self.log_test("Email invalide", False, 
                            f"Code statut inattendu: {response.status_code}")
                
        except Exception as e:
            self.log_test("Email invalide", False, f"Erreur: {str(e)}")
    
    def test_weak_password(self):
        """Test avec mot de passe faible"""
        user_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "123",  # Trop court
            "first_name": "Test",
            "last_name": "User",
            "phone": "+33123456789",
            "city": "Paris",
            "academic_level": "BAC",
            "referral_code_used": ""
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/register/", json=user_data)
            
            if response.status_code == 400:
                data = response.json()
                if "password" in data:
                    self.log_test("Mot de passe faible", True, "Erreur de validation détectée", data)
                else:
                    self.log_test("Mot de passe faible", False, "Erreur non détectée", data)
            else:
                self.log_test("Mot de passe faible", False, 
                            f"Code statut inattendu: {response.status_code}")
                
        except Exception as e:
            self.log_test("Mot de passe faible", False, f"Erreur: {str(e)}")
    
    def test_duplicate_username(self):
        """Test avec nom d'utilisateur déjà utilisé"""
        # D'abord créer un utilisateur
        existing_user = self.test_valid_registration()
        if not existing_user:
            self.log_test("Nom d'utilisateur duplicata", False, "Impossible de créer l'utilisateur de test")
            return
        
        # Essayer de créer un autre utilisateur avec le même nom
        user_data = {
            "username": existing_user["username"],  # Même nom d'utilisateur
            "email": f"test_{int(time.time())}@example.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User2",
            "phone": "+33123456780",
            "city": "Lyon",
            "academic_level": "LICENCE",
            "referral_code_used": ""
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/register/", json=user_data)
            
            if response.status_code == 400:
                data = response.json()
                if "username" in data:
                    self.log_test("Nom d'utilisateur duplicata", True, "Erreur de duplication détectée", data)
                else:
                    self.log_test("Nom d'utilisateur duplicata", False, "Erreur non détectée", data)
            else:
                self.log_test("Nom d'utilisateur duplicata", False, 
                            f"Code statut inattendu: {response.status_code}")
                
        except Exception as e:
            self.log_test("Nom d'utilisateur duplicata", False, f"Erreur: {str(e)}")
    
    def test_invalid_referral_code(self):
        """Test avec code de parrainage invalide"""
        user_data = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+33123456789",
            "city": "Paris",
            "academic_level": "BAC",
            "referral_code_used": "INVALID_CODE"
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/register/", json=user_data)
            
            if response.status_code == 400:
                data = response.json()
                if "referral_code_used" in data:
                    self.log_test("Code de parrainage invalide", True, "Erreur de validation détectée", data)
                else:
                    self.log_test("Code de parrainage invalide", False, "Erreur non détectée", data)
            else:
                self.log_test("Code de parrainage invalide", False, 
                            f"Code statut inattendu: {response.status_code}")
                
        except Exception as e:
            self.log_test("Code de parrainage invalide", False, f"Erreur: {str(e)}")
    
    def test_required_fields(self):
        """Test avec champs obligatoires manquants"""
        user_data = {
            "username": "",  # Vide
            "email": "",     # Vide
            "password": "",  # Vide
            "first_name": "Test",
            "last_name": "User",
            "phone": "",
            "city": "Paris",
            "academic_level": "BAC",
            "referral_code_used": ""
        }
        
        try:
            response = self.session.post(f"{API_URL}/auth/register/", json=user_data)
            
            if response.status_code == 400:
                data = response.json()
                missing_fields = []
                for field in ["username", "email", "password"]:
                    if field in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_test("Champs obligatoires", True, 
                                f"Erreurs détectées pour: {', '.join(missing_fields)}", data)
                else:
                    self.log_test("Champs obligatoires", False, "Erreurs non détectées", data)
            else:
                self.log_test("Champs obligatoires", False, 
                            f"Code statut inattendu: {response.status_code}")
                
        except Exception as e:
            self.log_test("Champs obligatoires", False, f"Erreur: {str(e)}")
    
    def run_all_tests(self):
        """Exécute tous les tests"""
        print("🧪 Démarrage des tests du processus d'enregistrement\n")
        
        # Test de connexion
        if not self.test_connection():
            print("❌ Impossible de se connecter à l'API. Arrêt des tests.")
            return
        
        print("\n📋 Tests de validation des données:")
        # Tests de validation
        self.test_invalid_email()
        self.test_weak_password()
        self.test_required_fields()
        
        print("\n🔄 Tests de duplication:")
        # Tests de duplication
        self.test_duplicate_username()
        
        print("\n🎁 Tests de parrainage:")
        # Tests de parrainage
        self.test_invalid_referral_code()
        
        print("\n✅ Tests de cas valides:")
        # Test de cas valide
        self.test_valid_registration()
        
        # Résumé des résultats
        self.print_summary()
    
    def print_summary(self):
        """Affiche le résumé des tests"""
        print("\n" + "="*60)
        print("📊 RÉSUMÉ DES TESTS")
        print("="*60)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total des tests: {total_tests}")
        print(f"✅ Réussis: {passed_tests}")
        print(f"❌ Échoués: {failed_tests}")
        print(f"Taux de réussite: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ TESTS ÉCHOUÉS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        # Sauvegarder les résultats
        with open("test_results_registration.json", "w", encoding="utf-8") as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Résultats sauvegardés dans: test_results_registration.json")

if __name__ == "__main__":
    tester = RegistrationTester()
    tester.run_all_tests()
