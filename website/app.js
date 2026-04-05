const STORAGE_KEYS = {
  token: 'km_admin_token',
  apiBase: 'km_admin_api_base',
  lang: 'km_admin_lang',
  role: 'km_admin_role',
};

const defaultApiBase = 'https://carecode.be/kmmobile/api';

const resources = {
  fr: {
    translation: {
      top: { title: 'Kingsmen Admin', subtitle: 'Gestion utilisateurs, acces, chat, myEvents', apiLabel: 'API', langLabel: 'Langue' },
      login: {
        title: 'Connexion admin', usernameLabel: 'Username ou email', passwordLabel: 'Mot de passe',
        submit: 'Se connecter', hint: 'Authentification via /login.php (meme backend que l\'app mobile).',
      },
      actions: { save: 'Sauver', logout: 'Deconnexion', refresh: 'Rafraichir', delete: 'Supprimer', cancel: 'Annuler', reply: 'Répondre', edit: 'Modifier' },
      tabs: { dashboard: 'Dashboard', users: 'Utilisateurs', access: 'Acces', chat: 'Moderation chat', myevents: 'MyEvents' },
      dashboard: { title: 'Dashboard', rooms: 'Salons', roomMessages: 'Messages salon', events: 'MyEvents', eventItems: 'Items event' },
      users: {
        title: 'Gestion utilisateurs', expected: 'Endpoint attendu: /admin_users.php', loading: 'Chargement...',
        empty: 'Aucun utilisateur.', loadFailed: 'Impossible de charger les utilisateurs:', missingEndpoint: 'Ajoute un endpoint JSON /admin_users.php pour activer cette page.',
        thId: 'ID', thUsername: 'Username', thEmail: 'Email', thRole: 'Role', thState: 'Etat', thActions: 'Actions',
        active: 'Actif', inactive: 'Inactif', activate: 'Activer', deactivate: 'Désactiver',
        toggleError: 'Erreur mise à jour:', selfDeactivation: 'Impossible de désactiver votre propre compte.',
        createBtn: '+ Ajouter', createTitle: 'Nouvel utilisateur', createSubmit: 'Créer',
        fieldFirstname: 'Prénom', fieldLastname: 'Nom', fieldUsername: 'Username',
        fieldEmail: 'Email', fieldPassword: 'Mot de passe', fieldRole: 'Rôle', fieldBirthday: 'Date de naissance',
        createSuccess: 'Utilisateur créé avec succès.', createError: 'Erreur création:',
      },
      access: {
        title: 'Gestion des accès',
        rolesTitle: 'Rôles disponibles',
        matrixTitle: 'Matrice des permissions',
        thRole: 'Rôle', thDescription: 'Description', thResource: 'Fonctionnalité', thAccess: 'Accès',
        roles: [
          { role: 'superadmin', badge: 'superadmin', description: 'Accès illimité à toutes les fonctionnalités. Peut gérer les admins.' },
          { role: 'admin',      badge: 'admin',      description: 'Accès complet : utilisateurs, events, chat, accès. Peut assigner des event_managers.' },
          { role: 'event_manager', badge: 'event_manager', description: 'Accès CRUD aux events dont il est manager (items, fichiers). Pas d\'accès aux utilisateurs ni au chat.' },
          { role: 'member',    badge: 'member',     description: 'Utilisateur de l\'app mobile uniquement. Aucun accès à l\'admin.' },
        ],
        matrix: [
          { resource: 'Dashboard',            admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Gestion utilisateurs', admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Gestion accès',        admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Modération chat',      admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Liste des events',     admin: '✅', eventManager: '✅', member: '—' },
          { resource: 'Créer / suppr. event', admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Items d\'event (CRUD)',admin: '✅', eventManager: '✅ (ses events)', member: '—' },
          { resource: 'Assigner managers',    admin: '✅', eventManager: '—',  member: '—' },
        ],
      },
      chat: {
        title: 'Moderation des salons', refreshRooms: 'Rafraichir salons', rooms: 'Salons', messages: 'Messages',
        loading: 'Chargement...', noVisibleRooms: 'Aucun salon visible.', roomId: 'id', roomLabel: 'room',
        loadMessagesError: 'Erreur chargement messages:', deleteConfirm: 'Supprimer ce message ?', deleteSuccess: 'Message supprime', deleteFailed: 'Suppression impossible:',
        thId: 'ID', thAuthor: 'Auteur', thDate: 'Date', thMessage: 'Message', thAction: 'Action', noMessages: 'Aucun message.',
        newRoomName: 'Nom du salon', newRoomDesc: 'Description', createRoomBtn: 'Creer', createRoomHeading: 'Nouveau salon',
        createRoomSuccess: 'Salon cree avec succes', createRoomError: 'Erreur lors de la creation du salon:',
        sendBtn: 'Envoyer', composePlaceholder: 'Ecrire un message…', replyingTo: 'Réponse à',
        sendSuccess: 'Message envoye', sendError: 'Erreur envoi:',
        editModalTitle: 'Modifier le message', editPlaceholder: 'Nouveau texte…', editSubmit: 'Enregistrer',
        editSuccess: 'Message modifié.', editError: 'Erreur modification:',
      },
      myevents: {
        title: 'Gestion page MyEvents', refresh: 'Rafraichir events', list: 'Mes events', items: 'Contenu event',
        loading: 'Chargement...', noVisibleEvents: 'Aucun event visible.', noItems: 'Aucun item pour cet event.',
        loadItemsError: 'Erreur chargement items:', eventLabel: 'event',
        createBtn: '+ Ajouter un event', createTitle: 'Nouvel event',
        fieldName: 'Nom', fieldStartsAt: 'Début', fieldEndsAt: 'Fin',
        createSubmit: 'Créer', createSuccess: 'Event créé avec succès.', createError: 'Erreur création:',
        deleteConfirm: 'Supprimer cet event et toutes ses données ?', deleteSuccess: 'Event supprimé.', deleteFailed: 'Suppression impossible:',
        thId: 'ID', thName: 'Nom', thStart: 'Début', thEnd: 'Fin', thAttendees: 'Participants', thActions: 'Actions',
        addItemBtn: '+ Ajouter du contenu', addItemTitle: 'Ajouter un item à l\'event',
        itemTypeLabel: 'Type', itemTypeText: 'Texte / émoticone', itemTypeFile: 'Fichier (jpg, png, pdf)',
        fieldTitle: 'Titre', fieldBody: 'Contenu (texte, émoticones…)', fieldFile: 'Fichier',
        addItemSubmit: 'Ajouter', addItemSuccess: 'Item ajouté.', addItemError: 'Erreur ajout:',
        editItemTitle: 'Modifier l\'item', editItemSubmit: 'Enregistrer',
        editItemSuccess: 'Item mis à jour.', editItemError: 'Erreur modification:',
        deleteItemConfirm: 'Supprimer cet item ?', deleteItemSuccess: 'Item supprimé.', deleteItemFailed: 'Suppression impossible:',
        viewFile: 'Voir le fichier',
        managersTitle: 'Gestionnaires de cet event',
        managersEmpty: 'Aucun gestionnaire assigné.',
        managerAssignPlaceholder: 'UUID ou username du gestionnaire',
        managerAssign: 'Assigner',
        managerRemove: 'Retirer',
        managerAssignSuccess: 'Gestionnaire assigné.',
        managerRemoveSuccess: 'Gestionnaire retiré.',
        managerError: 'Erreur gestionnaire:',
      },
      common: { unknown: 'Inconnu', error: 'Erreur' },
      toast: { apiSaved: 'API sauvegardee', loginOk: 'Connexion reussie', logoutOk: 'Deconnecte', invalidSession: 'Session invalide. Reconnecte-toi.' },
    },
  },
  en: {
    translation: {
      top: { title: 'Kingsmen Admin', subtitle: 'User, access, chat and myEvents management', apiLabel: 'API', langLabel: 'Language' },
      login: {
        title: 'Admin login', usernameLabel: 'Username or email', passwordLabel: 'Password',
        submit: 'Sign in', hint: 'Authentication via /login.php (same backend as mobile app).',
      },
      actions: { save: 'Save', logout: 'Logout', refresh: 'Refresh', delete: 'Delete', cancel: 'Cancel', reply: 'Reply', edit: 'Edit' },
      tabs: { dashboard: 'Dashboard', users: 'Users', access: 'Access', chat: 'Chat moderation', myevents: 'MyEvents' },
      dashboard: { title: 'Dashboard', rooms: 'Rooms', roomMessages: 'Room messages', events: 'MyEvents', eventItems: 'Event items' },
      users: {
        title: 'User management', expected: 'Expected endpoint: /admin_users.php', loading: 'Loading...',
        empty: 'No users.', loadFailed: 'Failed to load users:', missingEndpoint: 'Add a JSON endpoint /admin_users.php to enable this page.',
        thId: 'ID', thUsername: 'Username', thEmail: 'Email', thRole: 'Role', thState: 'State', thActions: 'Actions',
        active: 'Active', inactive: 'Inactive', activate: 'Activate', deactivate: 'Deactivate',
        toggleError: 'Update error:', selfDeactivation: 'Cannot deactivate your own account.',
        createBtn: '+ Add user', createTitle: 'New user', createSubmit: 'Create',
        fieldFirstname: 'First name', fieldLastname: 'Last name', fieldUsername: 'Username',
        fieldEmail: 'Email', fieldPassword: 'Password', fieldRole: 'Role', fieldBirthday: 'Birthday',
        createSuccess: 'User created successfully.', createError: 'Creation error:',
      },
      access: {
        title: 'Access management',
        rolesTitle: 'Available roles',
        matrixTitle: 'Permissions matrix',
        thRole: 'Role', thDescription: 'Description', thResource: 'Feature', thAccess: 'Access',
        roles: [
          { role: 'superadmin', badge: 'superadmin', description: 'Unlimited access to all features. Can manage admins.' },
          { role: 'admin',      badge: 'admin',      description: 'Full access: users, events, chat, access management. Can assign event_managers.' },
          { role: 'event_manager', badge: 'event_manager', description: 'CRUD access to assigned events (items, files). No access to users or chat.' },
          { role: 'member',    badge: 'member',     description: 'Mobile app user only. No admin access.' },
        ],
        matrix: [
          { resource: 'Dashboard',            admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'User management',      admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Access management',    admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Chat moderation',      admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Event list',           admin: '✅', eventManager: '✅', member: '—' },
          { resource: 'Create / delete event',admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Event items (CRUD)',   admin: '✅', eventManager: '✅ (own events)', member: '—' },
          { resource: 'Assign managers',      admin: '✅', eventManager: '—',  member: '—' },
        ],
      },
      chat: {
        title: 'Room moderation', refreshRooms: 'Refresh rooms', rooms: 'Rooms', messages: 'Messages',
        loading: 'Loading...', noVisibleRooms: 'No visible rooms.', roomId: 'id', roomLabel: 'room',
        loadMessagesError: 'Failed to load messages:', deleteConfirm: 'Delete this message?', deleteSuccess: 'Message deleted', deleteFailed: 'Deletion failed:',
        thId: 'ID', thAuthor: 'Author', thDate: 'Date', thMessage: 'Message', thAction: 'Action', noMessages: 'No messages.',
        newRoomName: 'Room name', newRoomDesc: 'Description', createRoomBtn: 'Create', createRoomHeading: 'New room',
        createRoomSuccess: 'Room created successfully', createRoomError: 'Error creating room:',
        sendBtn: 'Send', composePlaceholder: 'Write a message…', replyingTo: 'Replying to',
        sendSuccess: 'Message sent', sendError: 'Send error:',
        editModalTitle: 'Edit message', editPlaceholder: 'New text…', editSubmit: 'Save',
        editSuccess: 'Message updated.', editError: 'Edit error:',
      },
      myevents: {
        title: 'MyEvents page management', refresh: 'Refresh events', list: 'My events', items: 'Event content',
        loading: 'Loading...', noVisibleEvents: 'No visible events.', noItems: 'No items for this event.',
        loadItemsError: 'Failed to load items:', eventLabel: 'event',
        createBtn: '+ Add event', createTitle: 'New event',
        fieldName: 'Name', fieldStartsAt: 'Start date', fieldEndsAt: 'End date',
        createSubmit: 'Create', createSuccess: 'Event created successfully.', createError: 'Creation error:',
        deleteConfirm: 'Delete this event and all its data?', deleteSuccess: 'Event deleted.', deleteFailed: 'Deletion failed:',
        thId: 'ID', thName: 'Name', thStart: 'Start', thEnd: 'End', thAttendees: 'Attendees', thActions: 'Actions',
        addItemBtn: '+ Add content', addItemTitle: 'Add an item to the event',
        itemTypeLabel: 'Type', itemTypeText: 'Text / emoji', itemTypeFile: 'File (jpg, png, pdf)',
        fieldTitle: 'Title', fieldBody: 'Content (text, emoji…)', fieldFile: 'File',
        addItemSubmit: 'Add', addItemSuccess: 'Item added.', addItemError: 'Add error:',
        editItemTitle: 'Edit item', editItemSubmit: 'Save',
        editItemSuccess: 'Item updated.', editItemError: 'Edit error:',
        deleteItemConfirm: 'Delete this item?', deleteItemSuccess: 'Item deleted.', deleteItemFailed: 'Deletion failed:',
        viewFile: 'View file',
        managersTitle: 'Event managers',
        managersEmpty: 'No managers assigned.',
        managerAssignPlaceholder: 'Manager UUID or username',
        managerAssign: 'Assign',
        managerRemove: 'Remove',
        managerAssignSuccess: 'Manager assigned.',
        managerRemoveSuccess: 'Manager removed.',
        managerError: 'Manager error:',
      },
      common: { unknown: 'Unknown', error: 'Error' },
      toast: { apiSaved: 'API saved', loginOk: 'Login successful', logoutOk: 'Logged out', invalidSession: 'Invalid session. Please log in again.' },
    },
  },
  nl: {
    translation: {
      top: { title: 'Kingsmen Admin', subtitle: 'Beheer van gebruikers, toegang, chat en myEvents', apiLabel: 'API', langLabel: 'Taal' },
      login: {
        title: 'Admin aanmelding', usernameLabel: 'Gebruikersnaam of e-mail', passwordLabel: 'Wachtwoord',
        submit: 'Aanmelden', hint: 'Authenticatie via /login.php (zelfde backend als de mobiele app).',
      },
      actions: { save: 'Opslaan', logout: 'Afmelden', refresh: 'Vernieuwen', delete: 'Verwijderen', cancel: 'Annuleren', reply: 'Beantwoorden', edit: 'Bewerken' },
      tabs: { dashboard: 'Dashboard', users: 'Gebruikers', access: 'Toegang', chat: 'Chat moderatie', myevents: 'MyEvents' },
      dashboard: { title: 'Dashboard', rooms: 'Kanalen', roomMessages: 'Kanaalberichten', events: 'MyEvents', eventItems: 'Eventitems' },
      users: {
        title: 'Gebruikersbeheer', expected: 'Verwacht endpoint: /admin_users.php', loading: 'Laden...',
        empty: 'Geen gebruikers.', loadFailed: 'Gebruikers laden mislukt:', missingEndpoint: 'Voeg JSON-endpoint /admin_users.php toe om deze pagina te activeren.',
        thId: 'ID', thUsername: 'Gebruikersnaam', thEmail: 'E-mail', thRole: 'Rol', thState: 'Status', thActions: 'Acties',
        active: 'Actief', inactive: 'Inactief', activate: 'Activeren', deactivate: 'Deactiveren',
        toggleError: 'Updatefout:', selfDeactivation: 'U kunt uw eigen account niet deactiveren.',
        createBtn: '+ Toevoegen', createTitle: 'Nieuwe gebruiker', createSubmit: 'Aanmaken',
        fieldFirstname: 'Voornaam', fieldLastname: 'Achternaam', fieldUsername: 'Gebruikersnaam',
        fieldEmail: 'E-mail', fieldPassword: 'Wachtwoord', fieldRole: 'Rol', fieldBirthday: 'Geboortedatum',
        createSuccess: 'Gebruiker succesvol aangemaakt.', createError: 'Aanmaakfout:',
      },
      access: {
        title: 'Toegangsbeheer',
        rolesTitle: 'Beschikbare rollen',
        matrixTitle: 'Permissiematrix',
        thRole: 'Rol', thDescription: 'Beschrijving', thResource: 'Functie', thAccess: 'Toegang',
        roles: [
          { role: 'superadmin', badge: 'superadmin', description: 'Onbeperkte toegang tot alle functies. Kan admins beheren.' },
          { role: 'admin',      badge: 'admin',      description: 'Volledige toegang: gebruikers, events, chat, toegangsbeheer. Kan event_managers toewijzen.' },
          { role: 'event_manager', badge: 'event_manager', description: 'CRUD-toegang tot toegewezen events (items, bestanden). Geen toegang tot gebruikers of chat.' },
          { role: 'member',    badge: 'member',     description: 'Alleen mobiele app-gebruiker. Geen beheerderstoegang.' },
        ],
        matrix: [
          { resource: 'Dashboard',               admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Gebruikersbeheer',        admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Toegangsbeheer',          admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Chat moderatie',          admin: '✅', eventManager: '—',  member: '—' },
          { resource: 'Eventlijst',              admin: '✅', eventManager: '✅', member: '—' },
          { resource: 'Event aanmaken/verwijderen', admin: '✅', eventManager: '—', member: '—' },
          { resource: 'Eventitems (CRUD)',       admin: '✅', eventManager: '✅ (eigen events)', member: '—' },
          { resource: 'Beheerders toewijzen',    admin: '✅', eventManager: '—',  member: '—' },
        ],
      },
      chat: {
        title: 'Kanaalmoderatie', refreshRooms: 'Kanalen vernieuwen', rooms: 'Kanalen', messages: 'Berichten',
        loading: 'Laden...', noVisibleRooms: 'Geen zichtbare kanalen.', roomId: 'id', roomLabel: 'kanaal',
        loadMessagesError: 'Berichten laden mislukt:', deleteConfirm: 'Dit bericht verwijderen?', deleteSuccess: 'Bericht verwijderd', deleteFailed: 'Verwijderen mislukt:',
        thId: 'ID', thAuthor: 'Auteur', thDate: 'Datum', thMessage: 'Bericht', thAction: 'Actie', noMessages: 'Geen berichten.',
        newRoomName: 'Kanaalnaam', newRoomDesc: 'Beschrijving', createRoomBtn: 'Aanmaken', createRoomHeading: 'Nieuw kanaal',
        createRoomSuccess: 'Kanaal succesvol aangemaakt', createRoomError: 'Fout bij aanmaken kanaal:',
        sendBtn: 'Versturen', composePlaceholder: 'Schrijf een bericht…', replyingTo: 'Antwoord aan',
        sendSuccess: 'Bericht verzonden', sendError: 'Fout bij verzenden:',
        editModalTitle: 'Bericht bewerken', editPlaceholder: 'Nieuwe tekst…', editSubmit: 'Opslaan',
        editSuccess: 'Bericht bijgewerkt.', editError: 'Fout bij bewerken:',
      },
      myevents: {
        title: 'MyEvents pagina beheer', refresh: 'Events vernieuwen', list: 'Mijn events', items: 'Eventinhoud',
        loading: 'Laden...', noVisibleEvents: 'Geen zichtbare events.', noItems: 'Geen items voor dit event.',
        loadItemsError: 'Items laden mislukt:', eventLabel: 'event',
        createBtn: '+ Event toevoegen', createTitle: 'Nieuw event',
        fieldName: 'Naam', fieldStartsAt: 'Startdatum', fieldEndsAt: 'Einddatum',
        createSubmit: 'Aanmaken', createSuccess: 'Event succesvol aangemaakt.', createError: 'Aanmaakfout:',
        deleteConfirm: 'Dit event en alle bijbehorende gegevens verwijderen?', deleteSuccess: 'Event verwijderd.', deleteFailed: 'Verwijderen mislukt:',
        thId: 'ID', thName: 'Naam', thStart: 'Start', thEnd: 'Einde', thAttendees: 'Deelnemers', thActions: 'Acties',
        addItemBtn: '+ Inhoud toevoegen', addItemTitle: 'Item toevoegen aan event',
        itemTypeLabel: 'Type', itemTypeText: 'Tekst / emoji', itemTypeFile: 'Bestand (jpg, png, pdf)',
        fieldTitle: 'Titel', fieldBody: 'Inhoud (tekst, emoji…)', fieldFile: 'Bestand',
        addItemSubmit: 'Toevoegen', addItemSuccess: 'Item toegevoegd.', addItemError: 'Toevoegfout:',
        editItemTitle: 'Item bewerken', editItemSubmit: 'Opslaan',
        editItemSuccess: 'Item bijgewerkt.', editItemError: 'Bewerkfout:',
        deleteItemConfirm: 'Dit item verwijderen?', deleteItemSuccess: 'Item verwijderd.', deleteItemFailed: 'Verwijderen mislukt:',
        viewFile: 'Bestand bekijken',
        managersTitle: 'Eventbeheerders',
        managersEmpty: 'Geen beheerders toegewezen.',
        managerAssignPlaceholder: 'UUID of gebruikersnaam beheerder',
        managerAssign: 'Toewijzen',
        managerRemove: 'Verwijderen',
        managerAssignSuccess: 'Beheerder toegewezen.',
        managerRemoveSuccess: 'Beheerder verwijderd.',
        managerError: 'Beheerderfout:',
      },
      common: { unknown: 'Onbekend', error: 'Fout' },
      toast: { apiSaved: 'API opgeslagen', loginOk: 'Succesvol aangemeld', logoutOk: 'Afgemeld', invalidSession: 'Ongeldige sessie. Meld opnieuw aan.' },
    },
  },
};

const state = {
  token: localStorage.getItem(STORAGE_KEYS.token) || '',
  role: localStorage.getItem(STORAGE_KEYS.role) || 'member',
  apiBase: localStorage.getItem(STORAGE_KEYS.apiBase) || defaultApiBase,
  lang: localStorage.getItem(STORAGE_KEYS.lang) || 'fr',
  rooms: [],
  selectedRoomId: null,
  replyToMessage: null, // { id, author, text }
  events: [],
  selectedEventId: null,
  editingItemId: null,  // id of item being edited, null = add mode
};

const els = {
  apiBase: document.getElementById('apiBase'),
  languageSelect: document.getElementById('languageSelect'),
  saveApiBaseBtn: document.getElementById('saveApiBaseBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  loginSection: document.getElementById('loginSection'),
  adminSection: document.getElementById('adminSection'),
  loginForm: document.getElementById('loginForm'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  tabs: document.getElementById('tabs'),
  dashStats: document.getElementById('dashStats'),
  refreshUsersBtn: document.getElementById('refreshUsersBtn'),
  refreshAccessBtn: document.getElementById('refreshAccessBtn'),
  refreshRoomsBtn: document.getElementById('refreshRoomsBtn'),
  createRoomForm: document.getElementById('createRoomForm'),
  newRoomName: document.getElementById('newRoomName'),
  newRoomDesc: document.getElementById('newRoomDesc'),
  refreshEventsBtn: document.getElementById('refreshEventsBtn'),
  usersContent: document.getElementById('usersContent'),
  accessContent: document.getElementById('accessContent'),
  roomsList: document.getElementById('roomsList'),
  messagesTitle: document.getElementById('messagesTitle'),
  messagesContent: document.getElementById('messagesContent'),
  eventsList: document.getElementById('eventsList'),
  eventsTableContent: document.getElementById('eventsTableContent'),
  eventItemsTitle: document.getElementById('eventItemsTitle'),
  eventItemsContent: document.getElementById('eventItemsContent'),
  openCreateEventBtn: document.getElementById('openCreateEventBtn'),
  createEventModal: document.getElementById('createEventModal'),
  closeCreateEventBtn: document.getElementById('closeCreateEventBtn'),
  cancelCreateEventBtn: document.getElementById('cancelCreateEventBtn'),
  createEventForm: document.getElementById('createEventForm'),
  newEventName: document.getElementById('newEventName'),
  newEventStartsAt: document.getElementById('newEventStartsAt'),
  newEventEndsAt: document.getElementById('newEventEndsAt'),
  createEventError: document.getElementById('createEventError'),
  openAddItemBtn: document.getElementById('openAddItemBtn'),
  addItemModal: document.getElementById('addItemModal'),
  closeAddItemBtn: document.getElementById('closeAddItemBtn'),
  cancelAddItemBtn: document.getElementById('cancelAddItemBtn'),
  addItemForm: document.getElementById('addItemForm'),
  addItemType: document.getElementById('addItemType'),
  addItemTitle: document.getElementById('addItemTitle'),
  addItemBodyRow: document.getElementById('addItemBodyRow'),
  addItemBody: document.getElementById('addItemBody'),
  addItemFileRow: document.getElementById('addItemFileRow'),
  addItemFile: document.getElementById('addItemFile'),
  addItemError: document.getElementById('addItemError'),
  openCreateUserBtn: document.getElementById('openCreateUserBtn'),
  createUserModal: document.getElementById('createUserModal'),
  closeCreateUserBtn: document.getElementById('closeCreateUserBtn'),
  cancelCreateUserBtn: document.getElementById('cancelCreateUserBtn'),
  createUserForm: document.getElementById('createUserForm'),
  newUserFirstname: document.getElementById('newUserFirstname'),
  newUserLastname: document.getElementById('newUserLastname'),
  newUserUsername: document.getElementById('newUserUsername'),
  newUserEmail: document.getElementById('newUserEmail'),
  newUserPassword: document.getElementById('newUserPassword'),
  newUserRole: document.getElementById('newUserRole'),
  newUserBirthday: document.getElementById('newUserBirthday'),
  createUserError: document.getElementById('createUserError'),
  composeArea: document.getElementById('composeArea'),
  composeText: document.getElementById('composeText'),
  sendMessageBtn: document.getElementById('sendMessageBtn'),

  replyContext: document.getElementById('replyContext'),
  replyContextAuthor: document.getElementById('replyContextAuthor'),
  replyContextText: document.getElementById('replyContextText'),
  cancelReplyBtn: document.getElementById('cancelReplyBtn'),
  toast: document.getElementById('toast'),
};

function t(key, options = undefined) {
  return window.i18next.t(key, options);
}

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
}

function toast(message, type = '') {
  els.toast.textContent = message;
  els.toast.className = `toast ${type}`.trim();
  els.toast.classList.remove('hidden');
  setTimeout(() => els.toast.classList.add('hidden'), 3200);
}

function setAuthUI(loggedIn) {
  els.loginSection.classList.toggle('hidden', loggedIn);
  els.adminSection.classList.toggle('hidden', !loggedIn);
  els.logoutBtn.classList.toggle('hidden', !loggedIn);
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) menuToggle.classList.toggle('hidden', !loggedIn);

  // Adapt nav tabs visibility based on role
  if (loggedIn) {
    const isAdmin = state.role === 'admin' || state.role === 'superadmin';
    document.querySelector('[data-page="dashboard"]')?.classList.toggle('hidden', !isAdmin);
    document.querySelector('[data-page="users"]')?.classList.toggle('hidden', !isAdmin);
    document.querySelector('[data-page="access"]')?.classList.toggle('hidden', !isAdmin);
    document.querySelector('[data-page="chat"]')?.classList.toggle('hidden', !isAdmin);
    // openCreateEventBtn visible only for admins
    if (els.openCreateEventBtn) els.openCreateEventBtn.classList.toggle('hidden', !isAdmin);
  }
}

function escapeHtml(input) {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function apiFetch(path, options = {}) {
  const { skipContentType, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Accept', 'application/json');
  // For multipart/form-data (file upload), let the browser set Content-Type with boundary
  if (!skipContentType) {
    headers.set('Content-Type', 'application/json');
  }

  if (state.token) {
    headers.set('Authorization', `Bearer ${state.token}`);
  }

  try {
    const response = await fetch(`${state.apiBase}${path}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let detail = '';
      try {
        const data = await response.json();
        detail = data.message || data.error || JSON.stringify(data);
      } catch {
        detail = await response.text();
      }
      throw new Error(`${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return response.text();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Connection error: Could not reach ${state.apiBase}${path}. Make sure the API server is running.`);
    }
    throw error;
  }
}

// Normalise les clés d'objet (snake_case -> camelCase)
function normalizeKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeKeys(item));
  }
  
  const normalized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Convertir snake_case en camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[camelKey] = normalizeKeys(value);
  }
  return normalized;
}

function activatePage(pageId) {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.page === pageId);
  });
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.toggle('active', page.id === `page-${pageId}`);
  });
  // Ferme la sidebar sur mobile après navigation
  document.getElementById('sidebar')?.classList.remove('open');
}

function renderStats(stats) {
  const entries = [
    [t('dashboard.rooms'), stats.rooms],
    [t('dashboard.roomMessages'), stats.messages],
    [t('dashboard.events'), stats.events],
    [t('dashboard.eventItems'), stats.items],
  ];

  els.dashStats.innerHTML = entries
    .map(([label, value]) => `
      <article class="stat">
        <div class="label">${escapeHtml(label)}</div>
        <div class="value">${escapeHtml(value)}</div>
      </article>
    `)
    .join('');
}

async function loadDashboard() {
  const stats = { rooms: '-', messages: '-', events: '-', items: '-' };

  try {
    const response = await apiFetch('/chat_rooms.php');
    const rawRooms = Array.isArray(response) ? response : (response?.data ?? []);
    const rooms = normalizeKeys(rawRooms);
    stats.rooms = Array.isArray(rooms) ? rooms.length : 0;
  } catch (error) {
    console.error('Dashboard: Error loading rooms count:', error);
  }

  try {
    const response = await apiFetch('/my_events.php');
    const rawEvents = Array.isArray(response) ? response : (response?.data ?? []);
    const events = normalizeKeys(rawEvents);
    stats.events = Array.isArray(events) ? events.length : 0;
    if (Array.isArray(events) && events[0]) {
      const itemResponse = await apiFetch(`/my_event_items.php?eventId=${encodeURIComponent(events[0].id)}`);
      const rawItems = Array.isArray(itemResponse) ? itemResponse : (itemResponse?.data ?? []);
      const items = normalizeKeys(rawItems);
      stats.items = Array.isArray(items) ? items.length : 0;
    }
  } catch (error) {
    console.error('Dashboard: Error loading events:', error);
  }

  try {
    if (state.selectedRoomId) {
      const response = await apiFetch(`/chat_messages.php?roomId=${encodeURIComponent(state.selectedRoomId)}&limit=50`);
      const rawMessages = Array.isArray(response) ? response : (response?.data ?? []);
      const messages = normalizeKeys(rawMessages);
      stats.messages = Array.isArray(messages) ? messages.length : 0;
    }
  } catch (error) {
    console.error('Dashboard: Error loading messages:', error);
  }

  renderStats(stats);
}

function openCreateUserModal() {
  els.createUserForm.reset();
  els.createUserError.classList.add('hidden');
  els.createUserError.textContent = '';
  els.createUserModal.classList.remove('hidden');
  els.newUserFirstname.focus();
}

function closeCreateUserModal() {
  els.createUserModal.classList.add('hidden');
}

async function createUser() {
  els.createUserError.classList.add('hidden');
  els.createUserError.textContent = '';

  const body = {
    firstname: els.newUserFirstname.value.trim(),
    lastname:  els.newUserLastname.value.trim(),
    username:  els.newUserUsername.value.trim(),
    email:     els.newUserEmail.value.trim(),
    password:  els.newUserPassword.value,
    role:      els.newUserRole.value,
    birthday:  els.newUserBirthday.value || '1900-01-01',
  };

  try {
    await apiFetch('/admin_user_create.php', { method: 'POST', body: JSON.stringify(body) });
    closeCreateUserModal();
    toast(t('users.createSuccess'), 'success');
    await loadUsers();
  } catch (error) {
    const msg = error.message.includes('CONFLICT')
      ? (state.lang === 'fr' ? 'Ce username ou email existe déjà.' : state.lang === 'nl' ? 'Gebruikersnaam of e-mail bestaat al.' : 'Username or email already exists.')
      : `${t('users.createError')} ${error.message}`;
    els.createUserError.textContent = msg;
    els.createUserError.classList.remove('hidden');
  }
}

async function toggleUser(uuid) {
  try {
    const result = await apiFetch('/admin_user_toggle.php', {
      method: 'POST',
      body: JSON.stringify({ uuid }),
    });
    // Mise à jour locale sans rechargement complet
    const btn = document.querySelector(`[data-toggle-uuid="${CSS.escape(uuid)}"]`);
    if (btn) {
      const newActive = result.isActive;
      btn.dataset.toggleActive = newActive ? '1' : '0';
      btn.textContent = newActive ? t('users.deactivate') : t('users.activate');
      btn.className = `btn small ${newActive ? 'toggle-deactivate' : 'toggle-activate'}`;
      const statusCell = btn.closest('tr')?.querySelector('.user-status');
      if (statusCell) {
        statusCell.innerHTML = newActive
          ? `<span class="status-badge active">${escapeHtml(t('users.active'))}</span>`
          : `<span class="status-badge inactive">${escapeHtml(t('users.inactive'))}</span>`;
      }
    }
  } catch (error) {
    const msg = error.message.includes('SELF_DEACTIVATION')
      ? t('users.selfDeactivation')
      : `${t('users.toggleError')} ${error.message}`;
    toast(msg, 'error');
  }
}

async function loadUsers() {
  els.usersContent.innerHTML = `<p class="hint">${escapeHtml(t('users.loading'))}</p>`;
  try {
    const response = await apiFetch('/admin_users.php');
    const rawUsers = Array.isArray(response) ? response : (response?.data ?? []);
    const users = normalizeKeys(rawUsers);
    
    if (!Array.isArray(users)) throw new Error('Unexpected format');
    if (users.length === 0) {
      els.usersContent.innerHTML = `<p class="hint">${escapeHtml(t('users.empty'))}</p>`;
      return;
    }

    const rows = users.map((u) => {
      const active = u.isActive;
      const uuid = escapeHtml(u.uuid || u.id || '');
      return `
      <tr>
        <td class="code">${uuid}</td>
        <td>${escapeHtml(u.username || '')}</td>
        <td>${escapeHtml(u.email || '')}</td>
        <td>${escapeHtml(u.role || '-')}</td>
        <td class="user-status">
          <span class="status-badge ${active ? 'active' : 'inactive'}">
            ${escapeHtml(active ? t('users.active') : t('users.inactive'))}
          </span>
        </td>
        <td>
          <button class="btn small ${active ? 'toggle-deactivate' : 'toggle-activate'}"
            data-toggle-uuid="${uuid}"
            data-toggle-active="${active ? '1' : '0'}">
            ${escapeHtml(active ? t('users.deactivate') : t('users.activate'))}
          </button>
        </td>
      </tr>`;
    }).join('');

    els.usersContent.innerHTML = `
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>${escapeHtml(t('users.thId'))}</th>
            <th>${escapeHtml(t('users.thUsername'))}</th>
            <th>${escapeHtml(t('users.thEmail'))}</th>
            <th>${escapeHtml(t('users.thRole'))}</th>
            <th>${escapeHtml(t('users.thState'))}</th>
            <th>${escapeHtml(t('users.thActions'))}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Error loading users:', error);
    els.usersContent.innerHTML = `
      <p class="hint">${escapeHtml(t('users.loadFailed'))} ${escapeHtml(error.message)}</p>
      <p class="hint">${escapeHtml(t('users.missingEndpoint'))}</p>
    `;
  }
}

function loadAccess() {
  const roles  = t('access.roles',  { returnObjects: true });
  const matrix = t('access.matrix', { returnObjects: true });

  // Badge colour map
  const badgeClass = { superadmin: 'role-superadmin', admin: 'role-admin', event_manager: 'role-eventmanager', member: 'role-member' };

  const roleCards = Array.isArray(roles) ? roles.map((r) => `
    <article class="access-role-card">
      <span class="role-badge ${escapeHtml(badgeClass[r.role] ?? '')}">${escapeHtml(r.badge)}</span>
      <p class="access-role-desc">${escapeHtml(r.description)}</p>
    </article>`).join('') : '';

  const matrixRows = Array.isArray(matrix) ? matrix.map((row) => `
    <tr>
      <td>${escapeHtml(row.resource)}</td>
      <td class="access-cell">${escapeHtml(row.admin)}</td>
      <td class="access-cell">${escapeHtml(row.eventManager)}</td>
      <td class="access-cell">${escapeHtml(row.member)}</td>
    </tr>`).join('') : '';

  els.accessContent.innerHTML = `
    <h3 class="access-section-title">${escapeHtml(t('access.rolesTitle'))}</h3>
    <div class="access-roles-grid">${roleCards}</div>

    <h3 class="access-section-title" style="margin-top:2rem">${escapeHtml(t('access.matrixTitle'))}</h3>
    <div class="table-wrap">
      <table class="table">
        <thead><tr>
          <th>${escapeHtml(t('access.thResource'))}</th>
          <th class="access-cell">admin / superadmin</th>
          <th class="access-cell">event_manager</th>
          <th class="access-cell">member</th>
        </tr></thead>
        <tbody>${matrixRows}</tbody>
      </table>
    </div>`;
}

function renderRooms() {
  els.roomsList.innerHTML = state.rooms.map((room) => `
    <li class="list-item ${String(room.id) === String(state.selectedRoomId) ? 'active' : ''}" data-room-id="${escapeHtml(room.id)}">
      <div><strong>${escapeHtml(room.name || `Room ${room.id}`)}</strong></div>
      <div class="hint">${escapeHtml(t('chat.roomId'))}: ${escapeHtml(room.id)}</div>
    </li>
  `).join('');
}

function setReply(message) {
  state.replyToMessage = message;
  if (message) {
    els.replyContextAuthor.textContent = message.author;
    els.replyContextText.textContent = message.text.substring(0, 100);
    els.replyContext.classList.remove('hidden');
    els.composeText.focus();
  } else {
    els.replyContext.classList.add('hidden');
    els.replyContextAuthor.textContent = '';
    els.replyContextText.textContent = '';
  }
}

async function sendMessage() {
  const text = els.composeText.value.trim();
  if (!text || !state.selectedRoomId) return;

  const body = { roomId: state.selectedRoomId, text };
  if (state.replyToMessage) body.replyTo = state.replyToMessage.id;

  try {
    await apiFetch('/chat_post_message.php', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    els.composeText.value = '';
    setReply(null);
    toast(t('chat.sendSuccess'), 'success');
    await loadMessages(state.selectedRoomId);
  } catch (error) {
    toast(`${t('chat.sendError')} ${error.message}`, 'error');
  }
}

async function createRoom() {
  const name = els.newRoomName.value.trim();
  const desc = els.newRoomDesc.value.trim();
  if (!name) return;
  try {
    await apiFetch('/chat_room_create.php', {
      method: 'POST',
      body: JSON.stringify({ name, description: desc }),
    });
    toast(t('chat.createRoomSuccess'), 'success');
    els.newRoomName.value = '';
    els.newRoomDesc.value = '';
    await loadRooms();
  } catch (error) {
    toast(`${t('chat.createRoomError')} ${error.message}`, 'error');
  }
}

async function loadRooms() {
  els.roomsList.innerHTML = `<li class="hint">${escapeHtml(t('chat.loading'))}</li>`;
  try {
    const response = await apiFetch('/chat_rooms.php');
    const rawRooms = Array.isArray(response) ? response : (response?.data ?? []);
    const rooms = normalizeKeys(rawRooms);
    state.rooms = Array.isArray(rooms) ? rooms : [];
    
    if (!state.selectedRoomId && state.rooms[0]) {
      state.selectedRoomId = state.rooms[0].id;
    }
    renderRooms();
    if (state.selectedRoomId) {
      await loadMessages(state.selectedRoomId);
    } else {
      els.messagesContent.innerHTML = `<p class="hint">${escapeHtml(t('chat.noVisibleRooms'))}</p>`;
    }
  } catch (error) {
    console.error('Error loading rooms:', error);
    els.roomsList.innerHTML = `<li class="hint">${escapeHtml(t('common.error'))}: ${escapeHtml(error.message)}</li>`;
    els.messagesContent.innerHTML = '';
  }
}

async function deleteMessage(roomId, messageId) {
  try {
    await apiFetch('/chat_message_delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, messageId }),
    });
    toast(t('chat.deleteSuccess'), 'success');
    await loadMessages(roomId);
  } catch (jsonError) {
    console.warn('JSON delete failed, trying form-urlencoded:', jsonError);
    try {
      const form = new URLSearchParams();
      form.set('roomId', String(roomId));
      form.set('messageId', String(messageId));
      await apiFetch('/chat_message_delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      toast(t('chat.deleteSuccess'), 'success');
      await loadMessages(roomId);
    } catch (formError) {
      console.error('Form delete failed:', formError);
      toast(`${t('chat.deleteFailed')} ${formError.message}`, 'error');
    }
  }
}

async function editMessage(roomId, messageId, currentText) {
  const modal     = document.getElementById('editMessageModal');
  const textarea  = document.getElementById('editMessageText');
  const errorDiv  = document.getElementById('editMessageError');
  // Pre-fill modal
  textarea.value = currentText;
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
  modal.dataset.roomId = roomId;
  modal.dataset.messageId = messageId;
  modal.querySelector('.modal-title').textContent = t('chat.editModalTitle');
  textarea.placeholder = t('chat.editPlaceholder');
  modal.querySelector('[type="submit"]').textContent = t('chat.editSubmit');
  modal.classList.remove('hidden');
  textarea.focus();
}

async function saveEditMessage() {
  const modal     = document.getElementById('editMessageModal');
  const textarea  = document.getElementById('editMessageText');
  const errorDiv  = document.getElementById('editMessageError');
  const roomId    = modal.dataset.roomId;
  const messageId = modal.dataset.messageId;
  const text      = textarea.value.trim();
  if (!text) return;
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
  try {
    await apiFetch('/chat_message_update.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: Number(messageId), text }),
    });
    toast(t('chat.editSuccess'), 'success');
    modal.classList.add('hidden');
    await loadMessages(roomId);
  } catch (err) {
    errorDiv.textContent = `${t('chat.editError')} ${err.message}`;
    errorDiv.classList.remove('hidden');
  }
}

async function loadMessages(roomId) {
  els.messagesTitle.textContent = `${t('chat.messages')} - ${t('chat.roomLabel')} ${roomId}`;
  els.messagesContent.innerHTML = `<p class="hint">${escapeHtml(t('chat.loading'))}</p>`;

  try {
    const response = await apiFetch(`/chat_messages.php?roomId=${encodeURIComponent(roomId)}&limit=100`);
    const rawMessages = Array.isArray(response) ? response : (response?.data ?? []);
    const messages = normalizeKeys(rawMessages);

    const rows = (Array.isArray(messages) ? messages : []).map((m) => {
      const replyQuote = m.replyTo
        ? `<div class="msg-reply-quote">
             <span class="msg-reply-author">${escapeHtml(m.replyTo.author)}</span>
             <span class="msg-reply-text">${escapeHtml(m.replyTo.text)}</span>
           </div>`
        : '';
      return `
      <tr>
        <td class="code">${escapeHtml(m.id)}</td>
        <td>${escapeHtml(m.author?.displayName || m.userId || t('common.unknown'))}</td>
        <td>${escapeHtml(m.createdAt || '')}</td>
        <td>${replyQuote}${escapeHtml(m.text || '')}</td>
        <td class="actions-cell">
          <button class="btn small"
            data-reply-message-id="${escapeHtml(m.id)}"
            data-reply-author="${escapeHtml(m.author?.displayName || '')}"
            data-reply-text="${escapeHtml((m.text || '').substring(0, 100))}">
            ${escapeHtml(t('actions.reply'))}
          </button>
          <button class="btn small"
            data-edit-message-id="${escapeHtml(m.id)}"
            data-edit-room-id="${escapeHtml(roomId)}"
            data-edit-message-text="${escapeHtml(m.text || '')}">
            ${escapeHtml(t('actions.edit'))}
          </button>
          <button class="btn danger small"
            data-delete-message-id="${escapeHtml(m.id)}"
            data-delete-room-id="${escapeHtml(roomId)}">
            ${escapeHtml(t('actions.delete'))}
          </button>
        </td>
      </tr>`;
    }).join('');

    els.messagesContent.innerHTML = `
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>${escapeHtml(t('chat.thId'))}</th>
            <th>${escapeHtml(t('chat.thAuthor'))}</th>
            <th>${escapeHtml(t('chat.thDate'))}</th>
            <th>${escapeHtml(t('chat.thMessage'))}</th>
            <th>${escapeHtml(t('chat.thAction'))}</th>
          </tr></thead>
          <tbody>${rows || `<tr><td colspan="5">${escapeHtml(t('chat.noMessages'))}</td></tr>`}</tbody>
        </table>
      </div>
    `;

    // Afficher la zone de composition dès qu'un salon est sélectionné
    els.composeArea.classList.remove('hidden');
    els.composeText.placeholder = t('chat.composePlaceholder');
  } catch (error) {
    console.error('Error loading messages:', error);
    els.messagesContent.innerHTML = `<p class="hint">${escapeHtml(t('chat.loadMessagesError'))} ${escapeHtml(error.message)}</p>`;
  }
}

function renderEventsTable() {
  if (!els.eventsTableContent) return;
  if (state.events.length === 0) {
    els.eventsTableContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.noVisibleEvents'))}</p>`;
    return;
  }
  const isAdmin = state.role === 'admin' || state.role === 'superadmin';
  const rows = state.events.map((event) => `
    <tr>
      <td class="code">${escapeHtml(event.id)}</td>
      <td><strong>${escapeHtml(event.name || '')}</strong></td>
      <td>${escapeHtml(event.startsAt || '')}</td>
      <td>${escapeHtml(event.endsAt || '')}</td>
      <td>${escapeHtml(String(event.attendeeCount ?? 0))}</td>
      <td class="actions-cell">
        <button class="btn small"
          data-view-event-id="${escapeHtml(event.id)}">
          ${escapeHtml(t('myevents.items'))}
        </button>
        ${isAdmin ? `<button class="btn danger small"
          data-delete-event-id="${escapeHtml(event.id)}"
          data-delete-event-name="${escapeHtml(event.name || '')}">
          ${escapeHtml(t('actions.delete'))}
        </button>` : ''}
      </td>
    </tr>`
  ).join('');
  els.eventsTableContent.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead><tr>
          <th>${escapeHtml(t('myevents.thId'))}</th>
          <th>${escapeHtml(t('myevents.thName'))}</th>
          <th>${escapeHtml(t('myevents.thStart'))}</th>
          <th>${escapeHtml(t('myevents.thEnd'))}</th>
          <th>${escapeHtml(t('myevents.thAttendees'))}</th>
          <th>${escapeHtml(t('myevents.thActions'))}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function openCreateEventModal() {
  els.createEventForm.reset();
  els.createEventError.classList.add('hidden');
  els.createEventError.textContent = '';
  els.createEventModal.classList.remove('hidden');
  els.newEventName.focus();
}

function closeCreateEventModal() {
  els.createEventModal.classList.add('hidden');
}

async function createEvent() {
  els.createEventError.classList.add('hidden');
  els.createEventError.textContent = '';

  const body = {
    name:     els.newEventName.value.trim(),
    startsAt: els.newEventStartsAt.value,
    endsAt:   els.newEventEndsAt.value,
  };

  try {
    await apiFetch('/admin_event_create.php', { method: 'POST', body: JSON.stringify(body) });
    closeCreateEventModal();
    toast(t('myevents.createSuccess'), 'success');
    await loadEvents();
  } catch (error) {
    const msg = error.message.includes('CONFLICT')
      ? (state.lang === 'fr' ? 'Un event avec ce nom existe déjà.' : state.lang === 'nl' ? 'Een event met deze naam bestaat al.' : 'An event with this name already exists.')
      : `${t('myevents.createError')} ${error.message}`;
    els.createEventError.textContent = msg;
    els.createEventError.classList.remove('hidden');
  }
}

async function deleteEvent(id, name) {
  const confirmMsg = `${t('myevents.deleteConfirm')}\n"${name}"`;
  if (!confirm(confirmMsg)) return;
  try {
    await apiFetch('/admin_event_delete.php', { method: 'POST', body: JSON.stringify({ id }) });
    toast(t('myevents.deleteSuccess'), 'success');
    if (String(state.selectedEventId) === String(id)) {
      state.selectedEventId = null;
      if (els.eventItemsContent) els.eventItemsContent.innerHTML = '';
      if (els.eventItemsTitle) els.eventItemsTitle.textContent = t('myevents.items');
      if (els.openAddItemBtn) els.openAddItemBtn.style.display = 'none';
    }
    await loadEvents();
  } catch (error) {
    toast(`${t('myevents.deleteFailed')} ${error.message}`, 'error');
  }
}

function renderEvents() {
  // Kept for backward compat — now delegates to table renderer
  renderEventsTable();
}

async function loadEvents() {
  if (els.eventsTableContent) els.eventsTableContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.loading'))}</p>`;
  try {
    const response = await apiFetch('/admin_events.php');
    const rawEvents = Array.isArray(response) ? response : (response?.data ?? []);
    const events = normalizeKeys(rawEvents);
    state.events = Array.isArray(events) ? events : [];

    renderEventsTable();

    if (!state.selectedEventId && state.events[0]) {
      state.selectedEventId = state.events[0].id;
    }
    if (state.selectedEventId) {
      await loadEventItems(state.selectedEventId);
    } else if (els.eventItemsContent) {
      els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.noVisibleEvents'))}</p>`;
      if (els.openAddItemBtn) els.openAddItemBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading events:', error);
    if (els.eventsTableContent) els.eventsTableContent.innerHTML = `<p class="hint">${escapeHtml(t('common.error'))}: ${escapeHtml(error.message)}</p>`;
    if (els.eventItemsContent) els.eventItemsContent.innerHTML = '';
  }
}

async function loadEventItems(eventId) {
  els.eventItemsTitle.textContent = `${t('myevents.items')} #${eventId}`;
  els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.loading'))}</p>`;
  // Show / hide the add-item button depending on a selected event
  if (els.openAddItemBtn) els.openAddItemBtn.style.display = '';
  try {
    const response = await apiFetch(`/admin_event_item_list.php?eventId=${encodeURIComponent(eventId)}`);
    const rawItems = Array.isArray(response) ? response : (response?.data ?? []);
    const items = normalizeKeys(rawItems);
    renderEventItemsAdmin(Array.isArray(items) ? items : []);
  } catch (error) {
    console.error('Error loading event items:', error);
    els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.loadItemsError'))} ${escapeHtml(error.message)}</p>`;
  }
  // Admin-only: load managers panel below items
  const isAdmin = state.role === 'admin' || state.role === 'superadmin';
  let managersPanel = document.getElementById('eventManagersPanel');
  if (!managersPanel) {
    managersPanel = document.createElement('div');
    managersPanel.id = 'eventManagersPanel';
    managersPanel.className = 'managers-panel';
    els.eventItemsContent.parentElement.appendChild(managersPanel);
  }
  if (isAdmin) {
    managersPanel.classList.remove('hidden');
    await loadEventManagers(eventId);
  } else {
    managersPanel.classList.add('hidden');
    managersPanel.innerHTML = '';
  }
}

// ── Event managers (admin only) ───────────────────────────────────────────────

async function loadEventManagers(eventId) {
  const panel = document.getElementById('eventManagersPanel');
  if (!panel) return;
  panel.innerHTML = `<p class="hint">${escapeHtml(t('myevents.loading'))}</p>`;
  try {
    const response = await apiFetch(`/admin_event_manager_list.php?eventId=${encodeURIComponent(eventId)}`);
    const rawMgrs = Array.isArray(response) ? response : (response?.data ?? []);
    const managers = normalizeKeys(rawMgrs);
    renderEventManagers(eventId, Array.isArray(managers) ? managers : []);
  } catch (error) {
    panel.innerHTML = `<p class="hint">${escapeHtml(t('myevents.managerError'))} ${escapeHtml(error.message)}</p>`;
  }
}

function renderEventManagers(eventId, managers) {
  const panel = document.getElementById('eventManagersPanel');
  if (!panel) return;

  const rows = managers.length === 0
    ? `<p class="hint">${escapeHtml(t('myevents.managersEmpty'))}</p>`
    : managers.map((m) => `
        <div class="manager-row">
          <span class="manager-info">
            <strong>${escapeHtml(m.username || m.uuid)}</strong>
            ${m.firstname || m.lastname ? ` — ${escapeHtml([m.firstname, m.lastname].filter(Boolean).join(' '))}` : ''}
            <span class="hint code">${escapeHtml(m.uuid)}</span>
          </span>
          <button class="btn danger small"
            data-remove-manager-uuid="${escapeHtml(m.uuid)}"
            data-remove-manager-event="${escapeHtml(String(eventId))}">
            ${escapeHtml(t('myevents.managerRemove'))}
          </button>
        </div>`).join('');

  panel.innerHTML = `
    <div class="panel-label-row" style="margin-top:1.5rem">
      <p class="panel-label">${escapeHtml(t('myevents.managersTitle'))}</p>
    </div>
    <div id="managersList">${rows}</div>
    <div class="manager-assign-row" style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">
      <input id="managerUuidInput" type="text" class="cfg-input"
        placeholder="${escapeHtml(t('myevents.managerAssignPlaceholder'))}"
        style="flex:1;min-width:200px" />
      <button id="managerAssignBtn" class="btn primary-sm"
        data-assign-event="${escapeHtml(String(eventId))}">
        ${escapeHtml(t('myevents.managerAssign'))}
      </button>
    </div>`;

  // Wire assign button
  document.getElementById('managerAssignBtn')?.addEventListener('click', () => {
    const uuid = document.getElementById('managerUuidInput')?.value.trim();
    if (!uuid) return;
    void addEventManager(eventId, uuid);
  });

  // Wire remove buttons
  panel.querySelectorAll('[data-remove-manager-uuid]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void removeEventManager(btn.dataset.removeManagerEvent, btn.dataset.removeManagerUuid);
    });
  });
}

async function addEventManager(eventId, uuid) {
  try {
    await apiFetch('/admin_event_manager_add.php', {
      method: 'POST',
      body: JSON.stringify({ eventId: Number(eventId), uuid }),
    });
    const input = document.getElementById('managerUuidInput');
    if (input) input.value = '';
    toast(t('myevents.managerAssignSuccess'), 'success');
    await loadEventManagers(eventId);
  } catch (error) {
    toast(`${t('myevents.managerError')} ${error.message}`, 'error');
  }
}

async function removeEventManager(eventId, uuid) {
  try {
    await apiFetch('/admin_event_manager_remove.php', {
      method: 'POST',
      body: JSON.stringify({ eventId: Number(eventId), uuid }),
    });
    toast(t('myevents.managerRemoveSuccess'), 'success');
    await loadEventManagers(eventId);
  } catch (error) {
    toast(`${t('myevents.managerError')} ${error.message}`, 'error');
  }
}

function renderEventItemsAdmin(items) {
  if (!items.length) {
    els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.noItems'))}</p>`;
    return;
  }
  const blocks = items.map((item) => {
    const badge = escapeHtml(item.type || 'item');
    const title = escapeHtml(item.title || '(sans titre)');
    const body  = escapeHtml(item.body  || '');

    let filePreview = '';
    if (item.fileUrl) {
      const url = item.fileUrl;
      const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
      if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        filePreview = `
          <div class="item-file-preview">
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener">
              <img src="${escapeHtml(url)}" alt="${escapeHtml(item.title || 'image')}" class="item-preview-img" loading="lazy" />
            </a>
          </div>`;
      } else if (ext === 'pdf') {
        filePreview = `
          <div class="item-file-preview item-file-preview--pdf">
            <a class="item-pdf-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">
              <span class="item-pdf-icon">📄</span>
              <span>${escapeHtml(t('myevents.viewFile'))}</span>
            </a>
          </div>`;
      } else {
        filePreview = `<a class="item-file-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(t('myevents.viewFile'))}</a>`;
      }
    }

    return `
      <article class="list-item list-item--admin">
        <div class="item-badge">${badge}</div>
        <div class="item-body">
          <h4>${title}</h4>
          ${body ? `<p>${body}</p>` : ''}
          ${filePreview}
        </div>
        <div class="item-actions">
          <button class="btn small item-edit-btn"
            data-edit-item-id="${escapeHtml(String(item.id))}"
            data-edit-item-title="${escapeHtml(item.title || '')}"
            data-edit-item-body="${escapeHtml(item.body || '')}"
            data-edit-item-type="${escapeHtml(item.type || 'pin')}"
            data-edit-item-fileurl="${escapeHtml(item.fileUrl || '')}">
            ✏️ ${escapeHtml(t('actions.edit'))}
          </button>
          <button class="btn danger small item-delete-btn"
            data-delete-item-id="${escapeHtml(String(item.id))}"
            title="${escapeHtml(t('myevents.deleteItemConfirm'))}">
            ${escapeHtml(t('actions.delete'))}
          </button>
        </div>
      </article>`;
  }).join('');
  els.eventItemsContent.innerHTML = `<div class="items-grid">${blocks}</div>`;
}

function openAddItemModal() {
  if (!state.selectedEventId) return;
  els.addItemForm.reset();
  els.addItemError.classList.add('hidden');
  els.addItemError.textContent = '';
  // Show correct fields for default type
  updateAddItemFields();
  els.addItemModal.classList.remove('hidden');
  els.addItemTitle.focus();
}

function openEditItemModal(id, title, body, type, fileUrl) {
  state.editingItemId = id;
  els.addItemForm.reset();
  els.addItemError.classList.add('hidden');
  els.addItemError.textContent = '';
  // Set title/body
  els.addItemTitle.value = title;
  els.addItemBody.value  = body;
  // Determine displayed type
  const displayType = (type === 'file') ? 'file' : 'text';
  els.addItemType.value = displayType;
  updateAddItemFields();
  // If editing a file item, show current file as hint
  const fileHint = document.getElementById('editFileHint');
  if (fileHint) {
    if (fileUrl) {
      const name = fileUrl.split('/').pop();
      fileHint.textContent = `Fichier actuel : ${name}`;
      fileHint.style.display = '';
    } else {
      fileHint.style.display = 'none';
    }
  }
  // Update modal title and submit button
  const modalTitle = els.addItemModal.querySelector('.modal-header h3');
  if (modalTitle) modalTitle.textContent = t('myevents.editItemTitle');
  const submitBtn = els.addItemForm.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.textContent = t('myevents.editItemSubmit');
  // Hide type selector (can't change type while editing)
  const typeRow = els.addItemModal.querySelector('.form-field:first-child');
  if (typeRow) typeRow.style.display = 'none';
  els.addItemModal.classList.remove('hidden');
  els.addItemTitle.focus();
}

function closeAddItemModal() {
  state.editingItemId = null;
  els.addItemModal.classList.add('hidden');
  // Reset modal to add-mode appearance
  const modalTitle = els.addItemModal.querySelector('.modal-header h3');
  if (modalTitle) modalTitle.textContent = t('myevents.addItemTitle');
  const submitBtn = els.addItemForm.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.textContent = t('myevents.addItemSubmit');
  const typeRow = els.addItemModal.querySelector('.form-field:first-child');
  if (typeRow) typeRow.style.display = '';
  const fileHint = document.getElementById('editFileHint');
  if (fileHint) fileHint.style.display = 'none';
}

function updateAddItemFields() {
  const type = els.addItemType.value;
  const isFile = (type === 'file');
  els.addItemBodyRow.style.display = isFile ? 'none' : '';
  els.addItemFileRow.style.display = isFile ? '' : 'none';
  if (isFile) {
    els.addItemBody.removeAttribute('required');
    els.addItemFile.setAttribute('required', '');
  } else {
    els.addItemFile.removeAttribute('required');
    els.addItemBody.removeAttribute('required');
  }
}

async function createItem() {
  if (state.editingItemId) { await saveItem(); return; }
  els.addItemError.classList.add('hidden');
  els.addItemError.textContent = '';

  const type  = els.addItemType.value;
  const title = els.addItemTitle.value.trim();
  const body  = els.addItemBody.value.trim();
  const file  = els.addItemFile.files[0] ?? null;

  try {
    if (type === 'file') {
      if (!file) throw new Error('No file selected');
      const fd = new FormData();
      fd.append('eventId',  String(state.selectedEventId));
      fd.append('itemType', 'file');
      fd.append('title',    title);
      fd.append('file',     file);
      await apiFetch('/admin_event_item_create.php', { method: 'POST', body: fd, skipContentType: true });
    } else {
      const payload = { eventId: state.selectedEventId, itemType: 'text', title, body };
      await apiFetch('/admin_event_item_create.php', { method: 'POST', body: JSON.stringify(payload) });
    }
    closeAddItemModal();
    toast(t('myevents.addItemSuccess'), 'success');
    await loadEventItems(state.selectedEventId);
  } catch (error) {
    els.addItemError.textContent = `${t('myevents.addItemError')} ${error.message}`;
    els.addItemError.classList.remove('hidden');
  }
}

async function saveItem() {
  els.addItemError.classList.add('hidden');
  els.addItemError.textContent = '';

  const id    = state.editingItemId;
  const type  = els.addItemType.value;
  const title = els.addItemTitle.value.trim();
  const body  = els.addItemBody.value.trim();
  const file  = els.addItemFile.files[0] ?? null;

  try {
    if (file) {
      const fd = new FormData();
      fd.append('id',    String(id));
      fd.append('title', title);
      fd.append('body',  body);
      fd.append('file',  file);
      await apiFetch('/admin_event_item_update.php', { method: 'POST', body: fd, skipContentType: true });
    } else {
      await apiFetch('/admin_event_item_update.php', { method: 'POST', body: JSON.stringify({ id, title, body }) });
    }
    closeAddItemModal();
    toast(t('myevents.editItemSuccess'), 'success');
    await loadEventItems(state.selectedEventId);
  } catch (error) {
    els.addItemError.textContent = `${t('myevents.editItemError')} ${error.message}`;
    els.addItemError.classList.remove('hidden');
  }
}

async function deleteItem(id) {
  if (!confirm(t('myevents.deleteItemConfirm'))) return;
  try {
    await apiFetch('/admin_event_item_delete.php', { method: 'POST', body: JSON.stringify({ id }) });
    toast(t('myevents.deleteItemSuccess'), 'success');
    await loadEventItems(state.selectedEventId);
  } catch (error) {
    toast(`${t('myevents.deleteItemFailed')} ${error.message}`, 'error');
  }
}

async function login(username, password) {
  const form = new FormData();
  form.append('username', username);
  form.append('password', password);

  try {
    const response = await fetch(`${state.apiBase}/login.php`, {
      method: 'POST',
      body: form,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Login failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    if (!data?.token) throw new Error('Token missing in login response');

    state.token = data.token;
    localStorage.setItem(STORAGE_KEYS.token, state.token);
    // Decode role from JWT payload
    try {
      const jwtPayload = JSON.parse(atob(data.token.split('.')[1]));
      state.role = jwtPayload.role ?? 'member';
    } catch { state.role = 'member'; }
    localStorage.setItem(STORAGE_KEYS.role, state.role);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Connection error: Could not reach ${state.apiBase}/login.php. Make sure the API server is running and CORS is properly configured.`);
    }
    throw error;
  }
}

function logout() {
  state.token = '';
  state.role = 'member';
  state.rooms = [];
  state.selectedRoomId = null;
  state.events = [];
  state.selectedEventId = null;
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.role);
  setAuthUI(false);
}

function wireEvents() {
  els.saveApiBaseBtn.addEventListener('click', () => {
    state.apiBase = els.apiBase.value.trim().replace(/\/$/, '');
    localStorage.setItem(STORAGE_KEYS.apiBase, state.apiBase);
    toast(t('toast.apiSaved'), 'success');
  });

  els.languageSelect.addEventListener('change', async () => {
    state.lang = els.languageSelect.value;
    localStorage.setItem(STORAGE_KEYS.lang, state.lang);
    await window.i18next.changeLanguage(state.lang);
    applyStaticTranslations();
    await refreshCurrentPage();
  });

  els.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await login(els.username.value.trim(), els.password.value);
      setAuthUI(true);
      toast(t('toast.loginOk'), 'success');
      // Redirect event_manager directly to myevents tab
      const isAdmin = state.role === 'admin' || state.role === 'superadmin';
      if (!isAdmin) {
        activatePage('myevents');
        await loadEvents();
      } else {
        await Promise.all([loadRooms(), loadEvents(), loadDashboard()]);
      }
    } catch (error) {
      toast(error.message, 'error');
    }
  });

  els.logoutBtn.addEventListener('click', () => {
    logout();
    toast(t('toast.logoutOk'), 'success');
  });

  els.tabs.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-page]');
    if (!btn) return;
    const page = btn.dataset.page;
    activatePage(page);
    void refreshCurrentPage(page);
  });

  els.refreshUsersBtn.addEventListener('click', () => void loadUsers());
  els.openCreateUserBtn.addEventListener('click', openCreateUserModal);
  els.closeCreateUserBtn.addEventListener('click', closeCreateUserModal);
  els.cancelCreateUserBtn.addEventListener('click', closeCreateUserModal);
  els.createUserModal.addEventListener('click', (event) => {
    if (event.target === els.createUserModal) closeCreateUserModal();
  });
  els.createUserForm.addEventListener('submit', (event) => {
    event.preventDefault();
    void createUser();
  });

  els.usersContent.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-toggle-uuid]');
    if (!btn) return;
    void toggleUser(btn.dataset.toggleUuid);
  });
  els.refreshAccessBtn.addEventListener('click', () => loadAccess());
  els.refreshRoomsBtn.addEventListener('click', () => void loadRooms());

  els.createRoomForm.addEventListener('submit', (event) => {
    event.preventDefault();
    void createRoom();
  });
  els.refreshEventsBtn.addEventListener('click', () => void loadEvents());

  // Wiring modal create event
  els.openCreateEventBtn?.addEventListener('click', openCreateEventModal);
  els.closeCreateEventBtn?.addEventListener('click', closeCreateEventModal);
  els.cancelCreateEventBtn?.addEventListener('click', closeCreateEventModal);
  els.createEventModal?.addEventListener('click', (event) => {
    if (event.target === els.createEventModal) closeCreateEventModal();
  });
  els.createEventForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void createEvent();
  });

  // Wiring tableau events (view items + delete)
  document.getElementById('eventsTableContent')?.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('[data-view-event-id]');
    if (viewBtn) {
      state.selectedEventId = viewBtn.dataset.viewEventId;
      void loadEventItems(state.selectedEventId);
      return;
    }
    const delBtn = event.target.closest('[data-delete-event-id]');
    if (delBtn) {
      void deleteEvent(delBtn.dataset.deleteEventId, delBtn.dataset.deleteEventName);
    }
  });

  // Wiring modal add item
  els.openAddItemBtn?.addEventListener('click', openAddItemModal);
  els.closeAddItemBtn?.addEventListener('click', closeAddItemModal);
  els.cancelAddItemBtn?.addEventListener('click', closeAddItemModal);
  els.addItemModal?.addEventListener('click', (event) => {
    if (event.target === els.addItemModal) closeAddItemModal();
  });
  els.addItemType?.addEventListener('change', updateAddItemFields);
  els.addItemForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void createItem();
  });

  // Delegation: delete individual event item
  document.getElementById('eventItemsContent')?.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit-item-id]');
    if (editBtn) {
      openEditItemModal(
        editBtn.dataset.editItemId,
        editBtn.dataset.editItemTitle,
        editBtn.dataset.editItemBody,
        editBtn.dataset.editItemType,
        editBtn.dataset.editItemFileurl,
      );
      return;
    }
    const delBtn = event.target.closest('[data-delete-item-id]');
    if (delBtn) void deleteItem(delBtn.dataset.deleteItemId);
  });

  // Bouton hamburger (mobile)
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  els.roomsList.addEventListener('click', (event) => {
    const item = event.target.closest('[data-room-id]');
    if (!item) return;
    state.selectedRoomId = item.dataset.roomId;
    renderRooms();
    void loadMessages(state.selectedRoomId);
  });

  els.messagesContent.addEventListener('click', (event) => {
    const delBtn = event.target.closest('[data-delete-message-id]');
    if (delBtn) {
      const messageId = delBtn.dataset.deleteMessageId;
      const roomId = delBtn.dataset.deleteRoomId;
      if (!messageId || !roomId) return;
      if (!confirm(t('chat.deleteConfirm'))) return;
      void deleteMessage(roomId, messageId);
      return;
    }
    const editBtn = event.target.closest('[data-edit-message-id]');
    if (editBtn) {
      void editMessage(
        editBtn.dataset.editRoomId,
        editBtn.dataset.editMessageId,
        editBtn.dataset.editMessageText,
      );
      return;
    }
    const replyBtn = event.target.closest('[data-reply-message-id]');
    if (replyBtn) {
      setReply({
        id: replyBtn.dataset.replyMessageId,
        author: replyBtn.dataset.replyAuthor,
        text: replyBtn.dataset.replyText,
      });
    }
  });

  document.getElementById('closeEditMessageBtn').addEventListener('click', () => document.getElementById('editMessageModal').classList.add('hidden'));
  document.getElementById('cancelEditMessageBtn').addEventListener('click', () => document.getElementById('editMessageModal').classList.add('hidden'));
  document.getElementById('editMessageForm').addEventListener('submit', (e) => { e.preventDefault(); void saveEditMessage(); });

  els.cancelReplyBtn.addEventListener('click', () => setReply(null));

  els.sendMessageBtn.addEventListener('click', () => void sendMessage());

  els.composeText.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void sendMessage();
    }
  });

  // events list handled via eventsTableContent delegation above
}

async function refreshCurrentPage(forcedPage = null) {
  const activePage = forcedPage || document.querySelector('.tab.active')?.dataset.page || 'dashboard';

  if (activePage === 'dashboard') await loadDashboard();
  if (activePage === 'users') await loadUsers();
  if (activePage === 'access') loadAccess();
  if (activePage === 'chat') await loadRooms();
  if (activePage === 'myevents') await loadEvents();
}

async function boot() {
  await window.i18next.init({
    lng: state.lang,
    fallbackLng: 'fr',
    resources,
    interpolation: { escapeValue: false },
  });

  els.apiBase.value = state.apiBase;
  els.languageSelect.value = state.lang;
  applyStaticTranslations();
  wireEvents();

  if (!state.token) {
    setAuthUI(false);
    return;
  }

  setAuthUI(true);
  try {
    const isAdmin = state.role === 'admin' || state.role === 'superadmin';
    if (!isAdmin) {
      activatePage('myevents');
      await loadEvents();
    } else {
      await Promise.all([loadRooms(), loadEvents(), loadDashboard()]);
    }
  } catch {
    logout();
    toast(t('toast.invalidSession'), 'error');
  }
}

void boot();
