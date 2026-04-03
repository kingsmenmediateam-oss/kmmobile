# 🧪 Guide de Test de la Webapp Admin

## ✅ Checklist de Vérification

### 1. Serveur Web
- [x] Python HTTP server lancé sur port 8787
- [x] Fichiers statiques accessibles (HTML, CSS, JS)
- [x] MIME types corrects

```bash
# Vérifier:
curl -I http://localhost:8787/index.html
curl -I http://localhost:8787/app.js
curl -I http://localhost:8787/styles.css
```

### 2. Interface Utilisateur
- [ ] Page de login s'affiche correctement
- [ ] Sélecteur de langue fonctionne (FR/EN/NL)
- [ ] Champ de configuration API visible
- [ ] Traductions s18next fonctionnelles

### 3. Configuration API
- [ ] Pouvoir entrer l'URL de l'API
- [ ] Cliquer sur "Sauver"
- [ ] URL sauvegardée dans localStorage
- [ ] Message de confirmation "API sauvegardée"

### 4. Authentification
- [ ] Entrer des identifiants valides
- [ ] Recevoir un token JWT
- [ ] Token stocké dans localStorage
- [ ] Redirection vers le dashboard
- [ ] Erreur claire avec identifiants invalides

### 5. Dashboard
- [ ] Affiche les statistiques (salons, messages, events, items)
- [ ] Les chiffres se chargent correctement
- [ ] Pas d'erreur dans la console

### 6. Modération Chat
- [ ] Onglet Chat accessible après login
- [ ] Liste des salons s'affiche
- [ ] Messages du salon sélectionné s'affichent
- [ ] Tableau avec colonnes: ID, Auteur, Date, Message, Action
- [ ] Bouton "Supprimer" fonctionne
- [ ] Confirmation avant suppression
- [ ] Message "Supprimé avec succès"
- [ ] Rafraîchissement automatique après suppression

### 7. MyEvents
- [ ] Onglet Events accessible
- [ ] Liste des événements s'affiche
- [ ] Items de l'événement sélectionné s'affichent
- [ ] Chaque item affiche: badge type, titre, description
- [ ] Message "Aucun event" si vide

### 8. Utilisateurs (Admin)
- [ ] Onglet Utilisateurs accessible
- [ ] Tableau avec colonnes: ID, Username, Email, Role, Etat
- [ ] Données s'affichent correctement
- [ ] Message d'erreur clair si endpoint manquant

### 9. Accès (Admin)
- [ ] Onglet Accès accessible
- [ ] Tableau avec colonnes: Ressource, Role, Description
- [ ] Données s'affichent correctement
- [ ] Message d'erreur clair si endpoint manquant

### 10. Gestion des Erreurs
- [ ] Erreur de connexion CORS: message explicite
- [ ] Erreur 401: message "Session invalide"
- [ ] Erreur réseau: message de reconnexion
- [ ] API non trouvée: message amical

### 11. Déconnexion
- [ ] Bouton "Déconnexion" visible
- [ ] Cliquer affiche le formulaire de login
- [ ] Token supprimé de localStorage
- [ ] Message "Déconnecté"

---

## 🔍 Tests en Console

### Tester normalizeKeys()
```javascript
// Ouvrir la console (F12) et exécuter:
const testData = {
  user_id: 1,
  created_at: "2026-03-18T12:00:00Z",
  is_active: true
};
console.log(normalizeKeys(testData));
// Devrait afficher: { userId: 1, createdAt: "...", isActive: true }
```

### Vérifier le Token
```javascript
console.log(localStorage.getItem('km_admin_token'));
console.log(localStorage.getItem('km_admin_api_base'));
console.log(localStorage.getItem('km_admin_lang'));
```

### Tester l'API
```javascript
// Depuis la console:
await fetch('http://localhost:8000/api/chat_rooms.php', {
  headers: { Authorization: 'Bearer ' + state.token }
}).then(r => r.json()).then(console.log)
```

---

## 📊 Résultats Attendus

### Données Chat
```json
[
  {
    "id": "1",
    "name": "General",
    "description": "General discussion",
    "unreadCount": 5
  }
]
```

### Données Events
```json
[
  {
    "id": "1",
    "name": "Team Meeting",
    "startsAt": "2026-03-18T...",
    "endsAt": "2026-03-18T...",
    "role": "participant"
  }
]
```

### Données Users
```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "id": "1",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "admin",
    "isActive": true
  }
]
```

---

## 🐛 Débogage

### Activer les Logs
Tous les logs sont déjà affichés en console. Chercher:
```
[app.js:xxx] Error loading ...
```

### Inspecter les Requêtes
1. Ouvrir DevTools (F12)
2. Aller à "Network"
3. Filtrer par XHR
4. Cliquer sur une requête
5. Vérifier Status, Headers, Response

### Vérifier les Headers CORS
```bash
curl -v -H "Origin: http://localhost:8787" \
  http://localhost:8000/api/chat_rooms.php
```

Vérifier dans les headers:
- `Access-Control-Allow-Origin: http://localhost:8787`
- `Access-Control-Allow-Methods: GET, POST, ...`

---

## ✨ Points Clés à Valider

1. **Normalisation Clés**: Les données s'affichent sans erreur même avec clés snake_case
2. **CORS Robuste**: Pas d'erreur CORS, fonctionnement fluide
3. **Messages Clairs**: Chaque erreur a un message explicite
4. **Persistence**: Token et configuration sauvegardés
5. **Multilingue**: Changement de langue fonctionne
6. **Fallback**: Suppression de messages avec 2 formats
7. **Toast Notifications**: Affichage des succès/erreurs
8. **Empty States**: Messages quand pas de données

---

## 📝 Notes

- La webapp est 100% statique (HTML/CSS/JS)
- Pas de build nécessaire
- Fonctionne dans n'importe quel navigateur moderne
- Tous les appels API sont asynchrones
- Les données sont mises en cache minimalement

---

**À Tester:** Mars 18, 2026
