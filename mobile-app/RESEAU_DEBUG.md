# Guide de résolution des erreurs réseau - Expo Go

## 🚨 Problème : "Network Error" dans Expo Go

### 🔍 Cause principale
Votre application React Native essaie de se connecter à `localhost:8000`, mais depuis Expo Go sur votre téléphone, `localhost` ne fonctionne pas. Il faut utiliser l'IP locale de votre ordinateur.

---

## ⚡ Solution rapide

### 1. Trouvez l'IP de votre ordinateur

#### Sur Windows :
```cmd
ipconfig
```
Cherchez "Adresse IPv4" (probablement `192.168.x.x`)

#### Sur Mac/Linux :
```bash
ifconfig
```
ou
```bash
ip addr show
```

### 2. Modifiez la configuration

Dans le fichier `src/config/environment.ts`, remplacez :
```typescript
const LOCAL_IP = "172.20.10.4";
```
par votre vraie IP :
```typescript
const LOCAL_IP = "VOTRE_IP_ICI";
```

### 3. Redémarrez Expo Go

1. Fermez complètement Expo Go sur votre téléphone
2. Redémarrez le serveur Expo : `expo start`
3. Scannez le nouveau QR code

---

## 🔧 Solution avec débogueur intégré

J'ai ajouté un composant de débogage réseau à votre application :

1. **Démarrez l'application** dans Expo Go
2. **Connectez-vous** (même si ça échoue, continuez)
3. **Sur l'écran d'accueil**, vous verrez un bouton "Débogage Réseau" (rouge)
4. **Cliquez dessus** pour accéder à l'outil de diagnostic

Ce débogueur vous permettra de :
- ✅ Tester la connexion automatiquement
- 🔧 Voir votre configuration actuelle
- 📋 Obtenir des instructions détaillées
- 🔄 Tester différentes IPs

---

## 🛠️ Étapes détaillées

### Étape 1 : Vérifiez que votre backend fonctionne
```bash
# Dans le dossier de votre backend Django
python manage.py runserver
```

Vous devriez voir :
```
Starting development server at http://127.0.0.1:8000/
```

### Étape 2 : Trouvez votre IP locale

**Méthode 1 : Via les paramètres réseau**
- Windows : Paramètres > Réseau > Propriétés > Adresse IPv4
- Mac : Préférences Système > Réseau > Avancé > TCP/IP
- Linux : `ip addr show`

**Méthode 2 : Via commande**
```bash
# Windows
ipconfig | findstr "IPv4"

# Mac/Linux  
ip route get 1.1.1.1 | awk '{print $7}'
```

### Étape 3 : Testez la connectivité

Sur votre téléphone (dans le navigateur), allez à :
```
http://VOTRE_IP:8000/api/auth/test/
```

Si vous voyez une réponse JSON, c'est bon !

### Étape 4 : Configurez l'application

Dans `src/config/environment.ts` :
```typescript
export const getApiBaseUrl = () => {
  if (__DEV__) {
    // Remplacez par votre IP locale
    const LOCAL_IP = "192.168.1.XXX"; // Votre IP ici
    return `http://${LOCAL_IP}:8000`;
  }
  return "https://your-production-api.com";
};
```

### Étape 5 : Redémarrez tout

1. **Backend** : Redémarrez si nécessaire
2. **Expo** : `expo start -c` (pour clear cache)
3. **Téléphone**ouv : Fermez/rrez Expo Go

---

## 🐛 Problèmes courants et solutions

### ❌ "Network Error"
**Cause** : IP incorrecte ou backend arrêté
**Solution** : 
- Vérifiez que `python manage.py runserver` fonctionne
- Vérifiez l'IP dans `environment.ts`
- Utilisez le débogueur intégré

### ❌ "CORS Error"
**Cause** : Configuration CORS sur le backend
**Solution** dans Django :
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://VOTRE_IP:19000",  # IP Expo Go
    "http://VOTRE_IP:8000",   # IP backend
]
```

### ❌ "Timeout Error"
**Cause** : Firewall ou timeout trop court
**Solution** :
- Vérifiez que le port 8000 est ouvert
- Augmentez le timeout dans `api.ts`

### ❌ "Connection Refused"
**Cause** : Backend non démarré
**Solution** :
```bash
cd path/to/your/backend
python manage.py runserver 0.0.0.0:8000
```

---

## 📱 Configuration par plateforme

### Android Emulator
```typescript
const LOCAL_IP = "10.0.2.2";
```

### iOS Simulator  
```typescript
const LOCAL_IP = "172.20.10.4"; // ou votre IP locale
```

### Appareil physique (iOS/Android)
```typescript
const LOCAL_IP = "192.168.x.x"; // IP de votre ordinateur
```

---

## 🔍 Débogage avancé

### Utilisez le composant NetworkDebug

1. Importez le composant dans n'importe quel écran :
```typescript
import NetworkDebug from '../components/NetworkDebug';
```

2. Affichez-le conditionnellement :
```typescript
{__DEV__ && <NetworkDebug />}
```

### Logs de débogage

Dans la console Metro Bundler, vous devriez voir :
```
🚀 API Request: POST /api/auth/login/
✅ API Response: 200 /api/auth/login/
```

Si vous ne voyez pas ces logs, vérifiez que `__DEV__` est `true`.

---

## ✅ Checklist finale

- [ ] Backend Django démarré sur port 8000
- [ ] IP locale trouvée et configurée dans `environment.ts`
- [ ] Test manuel de connectivité depuis le navigateur du téléphone
- [ ] Expo Go redémarré complètement
- [ ] Cache clear : `expo start -c`
- [ ] Débogueur réseau utilisé pour diagnostic

Si le problème persiste après tous ces étapes, utilisez le débogueur intégré et partagez-moi les résultats !
