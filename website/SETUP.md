# Configuration et Test de la Webapp Admin

## 📋 Prérequis

1. **Backend API** doit être en cours d'exécution
2. **Python 3** pour lancer le serveur web local

## 🚀 Lancer la Webapp Localement

### Étape 1: Démarrer le serveur web
```bash
cd website
bash run.sh
```
Ou avec un port personnalisé:
```bash
bash run.sh 3000
```

La webapp est alors accessible à `http://localhost:8787` (ou le port spécifié).

### Étape 2: Configurer l'URL de l'API

1. Ouvrir la webapp dans un navigateur
2. Dans le champ **API** en haut à gauche, entrer l'URL de base du backend:
   - Pour un développement local: `http://localhost:8000/api` (ajuster le port selon votre setup)
   - Pour la prod: `https://carecode.be/kmmobile/api`
3. Cliquer sur **Sauver**

**Note**: L'URL est sauvegardée dans `localStorage` et persiste entre les sessions.

## 🔑 Se Connecter

1. Entrer vos identifiants (username/email et password)
2. Cliquer sur **Se connecter**

Le token JWT est stocké dans `localStorage` et utilisé pour tous les appels API suivants.

## 📊 Fonctionnalités Disponibles

### Dashboard
Affiche les statistiques en temps réel:
- Nombre de salons de chat
- Nombre de messages dans le salon sélectionné
- Nombre d'events
- Nombre d'items dans l'event sélectionné

### Modération Chat
- **Salons**: Liste des salons accessibles
- **Messages**: Affiche les messages du salon sélectionné
- **Suppression**: Bouton pour supprimer des messages (avec fallback x-www-form-urlencoded)

### MyEvents
- **Mes Events**: Liste des événements accessibles
- **Contenu Event**: Affiche les items (blocs d'information) de l'événement sélectionné

### Utilisateurs
- Page pour la gestion des utilisateurs (nécessite endpoint `/admin_users.php`)

### Accès
- Page pour la gestion des droits d'accès (nécessite endpoint `/admin_access.php`)

## 🔧 Architecture Technique

### Points d'Amélioration Implémentés

1. **Normalisation des Clés (snake_case → camelCase)**
   - Les endpoints PHP retournent du JSON en snake_case (ex: `created_at`, `user_id`)
   - La fonction `normalizeKeys()` convertit automatiquement en camelCase
   - Permet une gestion cohérente des données dans la webapp

2. **Gestion Robuste des Erreurs**
   - Détection des erreurs de connexion CORS
   - Messages d'erreur explicites et affichés à l'utilisateur
   - Logs console pour le débogage
   - Fallbacks pour la suppression de messages (JSON → form-urlencoded)

3. **Support CORS**
   - Headers `Accept` et `Content-Type` correctement configurés
   - Token JWT inclus dans l'header `Authorization`
   - Gestion des réponses envoyées avec ou sans clé `data`

4. **Affichage des Erreurs**
   - Toast notifications pour les succès et erreurs
   - Messages explicites en cas d'endpoint manquant
   - Logs détaillés dans la console du navigateur

## 📝 Endpoints Consommés

### Obligatoires
- `POST /login.php` - Authentification JWT
- `GET /chat_rooms.php` - Liste des salons
- `GET /chat_messages.php?roomId=...` - Messages d'un salon
- `POST /chat_message_delete.php` - Suppression de message
- `GET /my_events.php` - Liste des événements
- `GET /my_event_items.php?eventId=...` - Items d'un événement

### Optionnels (pages gestion utilisateurs/accès)
- `GET /admin_users.php` - Liste des utilisateurs
- `GET /admin_access.php` - Règles d'accès

## 🐛 Dépannage

### "Connection error: Could not reach ..."
- Vérifiez que le backend API est en cours d'exécution
- Vérifiez l'URL de l'API dans le champ de configuration
- Vérifiez les paramètres CORS du backend

### "401 Unauthorized"
- Le token JWT est invalide ou expiré
- Reconnectez-vous

### "CORS error" dans la console
- Les headers CORS ne sont pas correctement configurés sur le backend
- Les fichiers PHP doivent inclure les headers CORS appropriés

### Les données ne s'affichent pas
- Ouvrez la console du navigateur (F12)
- Vérifiez les messages d'erreur
- Vérifiez la structure des données retournées par l'API (clés snake_case/camelCase)

## 🌍 Multilingue

La langue est changeable via le sélecteur en haut à droite:
- **Français** (par défaut)
- **English**
- **Nederlands**

Le choix est sauvegardé dans `localStorage` (`km_admin_lang`).

## 📦 Dépendances

La webapp est 100% statique et utilise:
- `i18next.min.js` (localisation) - inclus localement dans `vendor/`
- Aucune autre dépendance (pas de framework, pas de build)

## 🚪 Sortir et Revenir

1. Cliquer sur **Déconnexion** pour supprimer le token
2. Le token JWT est stocké dans `localStorage`, vous resterez connecté après un rafraîchissement
3. Les erreurs de session vous reconnecter automatiquement

---

**Dernière mise à jour**: Mars 2026
