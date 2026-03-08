# Website Admin (webapp)

Mini webapp admin statique qui consomme le meme backend que l'app mobile.

## Lancer localement

Depuis la racine du repo:

```bash
cd website
./run.sh
```

Puis ouvrir `http://localhost:8787`.

## Configuration API

Par defaut: `https://carecode.be/kmmobile/api`

Tu peux changer la base URL dans l'entete (champ `API`) et sauvegarder.

## Multilingue

Le module `i18next` est installe dans le projet et embarque localement dans:

- `website/vendor/i18next.min.js`

Langues disponibles via le selecteur en haut:

- Francais (`fr`)
- English (`en`)
- Nederlands (`nl`)

La langue choisie est memorisee dans `localStorage` (`km_admin_lang`).

## Fonctionnalites

- Login JWT via `/login.php`
- Moderation chat:
  - liste salons: `/chat_rooms.php`
  - liste messages: `/chat_messages.php?roomId=...`
  - suppression message: `/chat_message_delete.php` (JSON puis fallback x-www-form-urlencoded)
- Gestion MyEvents:
  - liste events: `/my_events.php`
  - items d'un event: `/my_event_items.php?eventId=...`
- Dashboard:
  - stats basees sur les endpoints ci-dessus

## Endpoints attendus pour completion users/access

La webapp inclut deja les pages et le rendu, et tentera d'appeler:

- `/admin_users.php`
- `/admin_access.php`

Si ces endpoints n'existent pas encore, la page affiche un fallback explicite.

## Notes

- Frontend 100% statique (HTML/CSS/JS), pas de build requis.
- Le token JWT est stocke dans `localStorage` (`km_admin_token`).
