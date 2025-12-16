# Elite 2.0 - Application Mobile React Native

Application mobile complète pour la plateforme de formation en ligne Elite 2.0.

## Fonctionnalités Implémentées

### ✅ Authentification
- Inscription avec tous les champs (nom, prénom, téléphone, ville, niveau académique)
- Code de parrainage optionnel lors de l'inscription
- Connexion avec JWT tokens
- Gestion de session persistante avec AsyncStorage
- Redirection automatique selon l'état d'authentification

### ✅ Système de Correspondance (Matching)
- Formulaire avec questions à choix multiples
- Navigation entre questions avec barre de progression
- Algorithme de recommandation de profils (idéal, secondaire, tertiaire)
- Sélection de profil parmi les recommandations
- Recherche manuelle de profils si aucun ne convient

### ✅ Parcours Adaptatif
- Affichage du parcours personnalisé selon profil et niveau académique
- Visualisation des étapes avec durée estimée
- Adaptation visuelle selon le niveau (BEPC, BAC, Licence)
- Validation du parcours avec navigation vers les cours

### ✅ Packs de Cours et Paiement
- Liste des packs disponibles par domaine
- Détails des packs avec prix et nombre de chapitres
- Modal de sélection du mode de paiement (Mobile Money, Carte bancaire)
- Intégration de l'achat avec le backend
- Indicateur d'achat sur les packs déjà possédés

### ✅ Interface de Cours
- Liste des chapitres avec sidebar de navigation
- Affichage du contenu textuel
- Lecteur vidéo intégré (Expo AV)
- Système de progression des chapitres (IN_PROGRESS, COMPLETED, LOCKED)
- Indicateur visuel de l'état de chaque chapitre

### ✅ Système de Quiz
- Quiz de fin de chapitre avec questions à choix multiples
- Navigation entre questions
- Compteur de questions répondues
- Soumission avec vérification des réponses manquantes
- Calcul du score sur 20

### ✅ Logique Conditionnelle des Quiz
- **Score ≥ 14** : Chapitre validé → Bouton "Chapitre suivant"
- **10 ≤ Score < 14** : 
  - Option 1 : Parrainer 4 membres pour débloquer
  - Option 2 : Recommencer le chapitre
  - Affichage du nombre de parrainages actuels
- **Score < 10** : Recommencer obligatoire
- Écran de félicitations si dernier chapitre terminé

### ✅ Fin de Formation
- Écran de félicitations avec icône de succès
- Liste des centres physiques dans la ville de l'utilisateur
- Informations de contact (téléphone, email)
- Possibilité d'appeler ou d'envoyer un email directement

### ✅ Système de Parrainage
- Affichage du code de parrainage unique
- Boutons copier et partager le code
- Statistiques : nombre de parrainages et points accumulés
- Écran des récompenses disponibles
- Échange de points contre :
  - Packs de cours gratuits
  - Bourses
- Vérification des points avant échange

### ✅ Chat Entre Utilisateurs
- Liste des conversations
- Recherche d'utilisateurs pour nouvelle conversation
- Interface de chat avec messages
- Polling toutes les 3 secondes pour mise à jour (en attendant WebSocket)
- Affichage de l'heure des messages
- Distinction visuelle entre messages envoyés et reçus
- Bouton FAB pour nouvelle conversation

### ✅ Offres d'Emploi
- Liste des offres avec entreprise et localisation
- Accordéon pour afficher les détails
- Description du poste
- Exigences
- Fourchette salariale
- Bouton de candidature (ouverture URL externe)

### ✅ Concours
- Liste des concours disponibles
- Détails : organisateur, description, éligibilité
- Dates d'inscription et d'examen
- Bouton d'inscription (ouverture URL externe)

### ✅ FAQ avec IA
- Liste des questions fréquentes par catégorie
- Recherche dans les FAQ
- Chat IA intégré pour questions personnalisées
- Intégration OpenAI GPT-3.5 via backend
- Interface conversationnelle avec l'IA

### ✅ Profil Utilisateur
- Informations personnelles (email, téléphone, ville, niveau)
- Section parrainage avec code et statistiques
- Bouton d'accès aux récompenses
- Menu d'aide et FAQ
- Déconnexion sécurisée

### ✅ Navigation
- Bottom Tab Navigation : Accueil, Cours, Chat, Offres, Profil
- Stack Navigation pour les sous-écrans
- Navigation conditionnelle selon l'état utilisateur
- Redirection automatique vers le formulaire de matching si non complété

## Architecture Technique

### Structure des Dossiers
\`\`\`
mobile-app/
├── src/
│   ├── config/
│   │   └── api.ts                    # Configuration Axios et intercepteurs
│   ├── navigation/
│   │   ├── AppNavigator.tsx          # Navigation principale
│   │   ├── AuthNavigator.tsx         # Navigation authentification
│   │   └── MainNavigator.tsx         # Navigation app (avec tabs)
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── matching/
│   │   │   ├── MatchingFormScreen.tsx
│   │   │   ├── MatchingResultsScreen.tsx
│   │   │   ├── ManualProfileSearchScreen.tsx
│   │   │   └── AdaptivePathScreen.tsx
│   │   ├── courses/
│   │   │   ├── CourseListScreen.tsx
│   │   │   ├── CoursePacksScreen.tsx
│   │   │   ├── ChapterScreen.tsx
│   │   │   ├── QuizScreen.tsx
│   │   │   └── QuizResultScreen.tsx
│   │   ├── chat/
│   │   │   ├── ChatListScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   └── UserSearchScreen.tsx
│   │   ├── opportunities/
│   │   │   ├── JobOffersScreen.tsx
│   │   │   └── CompetitionsScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── RewardsScreen.tsx
│   │   ├── faq/
│   │   │   └── FAQScreen.tsx
│   │   ├── centers/
│   │   │   └── PhysicalCentersScreen.tsx
│   │   └── home/
│   │       └── HomeScreen.tsx
│   └── store/
│       ├── index.ts                   # Configuration Redux store
│       └── slices/
│           ├── authSlice.ts           # État authentification
│           ├── courseSlice.ts         # État cours
│           └── chatSlice.ts           # État chat
├── App.tsx
├── package.json
└── README.md
\`\`\`

### Technologies Utilisées

- **React Native 0.73** : Framework mobile cross-platform
- **Expo 50** : Toolchain de développement et déploiement
- **React Navigation 6** : Navigation (Stack, Bottom Tabs, Drawer)
- **Redux Toolkit 2.0** : Gestion d'état globale
- **Axios 1.6** : Client HTTP pour les appels API
- **AsyncStorage** : Stockage persistant local
- **Expo AV** : Lecteur vidéo natif
- **Expo Clipboard** : Copie dans le presse-papier
- **Expo Sharing** : Partage natif
- **@expo/vector-icons** : Icônes Ionicons
- **TypeScript 5.3** : Typage statique

## Installation et Configuration

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI
- Backend Django Elite 2.0 en cours d'exécution

### Installation

\`\`\`bash
cd mobile-app
npm install
\`\`\`

### Configuration de l'API

Modifiez `src/config/api.ts` pour pointer vers votre backend :

\`\`\`typescript
export const API_BASE_URL = "http://YOUR_IP_ADDRESS:8000"
\`\`\`

**Note** : Pour Android, utilisez l'IP de votre machine, pas `localhost`.
Pour iOS Simulator, `localhost` fonctionne.

### Lancement

\`\`\`bash
# Démarrer le serveur de développement
npm start

# Lancer sur iOS
npm run ios

# Lancer sur Android
npm run android

# Lancer sur le web
npm run web
\`\`\`

## Endpoints API Utilisés

L'application communique avec le backend Django via les endpoints suivants :

### Authentification
- `POST /api/token/` : Obtenir un token JWT
- `POST /auth/register/` : Inscription utilisateur
- `GET /api/profile/` : Profil utilisateur actuel

### Matching et Profils
- `GET /api/matching-questions/` : Questions du formulaire
- `POST /api/submit-matching-form/` : Soumettre les réponses
- `POST /api/select-profile/` : Sélectionner un profil
- `GET /api/profiles/` : Tous les profils disponibles
- `GET /api/adaptive-path/` : Parcours adaptatif de l'utilisateur
- `POST /api/validate-path/` : Valider le parcours

### Cours et Packs
- `GET /api/course-packs/` : Liste des packs de cours
- `POST /api/course-packs/:id/purchase/` : Acheter un pack
- `GET /api/user-courses/` : Cours achetés par l'utilisateur
- `GET /api/chapter-progress/:id/` : Progression d'un chapitre

### Quiz
- `GET /api/quiz/:chapterId/` : Quiz d'un chapitre
- `POST /api/submit-quiz/:chapterId/` : Soumettre un quiz
- `POST /api/use-referral-bypass/:chapterId/` : Utiliser l'option parrainage

### Parrainage
- `GET /api/referral-stats/` : Statistiques de parrainage
- `GET /api/referral-rewards/` : Récompenses disponibles
- `POST /api/referral-rewards/:id/redeem/` : Échanger des points

### Chat
- `GET /api/chat-messages/` : Liste des messages
- `POST /api/chat-messages/` : Envoyer un message
- `GET /api/chat-messages/conversations/` : Conversations de l'utilisateur
- `GET /api/chat-messages/with-user/?user_id=X` : Messages avec un utilisateur

### Opportunités
- `GET /api/job-offers/` : Offres d'emploi
- `GET /api/competitions/` : Concours disponibles

### Support
- `GET /api/faq/` : Questions fréquentes
- `POST /api/ask-ai-faq/` : Poser une question à l'IA
- `GET /api/physical-centers/` : Centres physiques

## Fonctionnalités à Implémenter (Futures)

- [ ] WebSocket pour le chat temps réel (actuellement polling)
- [ ] Notifications push pour nouveaux messages et parrainages
- [ ] Mode hors ligne avec synchronisation
- [ ] Téléchargement de vidéos pour visionnage hors ligne
- [ ] Tests unitaires et d'intégration
- [ ] Internationalisation (i18n)
- [ ] Mode sombre
- [ ] Animations et transitions avancées

## Notes de Développement

### Gestion de l'État
- Redux Toolkit pour l'état global (auth, courses, chat)
- État local React pour les données temporaires

### Sécurité
- Tokens JWT stockés de manière sécurisée dans AsyncStorage
- Intercepteurs Axios pour ajouter automatiquement le token
- Déconnexion automatique sur erreur 401
- Validation côté client avant soumission

### Performance
- FlatList pour les listes longues (optimisation du rendu)
- Chargement paresseux des images
- Mise en cache des données avec Redux

### UX/UI
- Design Material inspiré avec couleurs cohérentes
- Feedback visuel pour toutes les actions
- Loading states et error handling
- Messages d'erreur clairs et en français
- Navigation intuitive

## Déploiement

### Build de Production

\`\`\`bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios
\`\`\`

Consultez la [documentation Expo EAS](https://docs.expo.dev/build/introduction/) pour plus de détails.

## Support

Pour toute question ou problème :
1. Vérifiez que le backend Django est accessible
2. Vérifiez l'URL de l'API dans `src/config/api.ts`
3. Vérifiez les logs du backend pour les erreurs API
4. Consultez les logs Expo avec `npm start` et appuyez sur `d` pour les dev tools

## License

Propriété de Elite 2.0
