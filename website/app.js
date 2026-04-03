const STORAGE_KEYS = {
  token: 'km_admin_token',
  apiBase: 'km_admin_api_base',
  lang: 'km_admin_lang',
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
      actions: { save: 'Sauver', logout: 'Deconnexion', refresh: 'Rafraichir', delete: 'Supprimer', cancel: 'Annuler', reply: 'Répondre' },
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
        title: 'Gestion des acces', expected: 'Endpoint attendu: /admin_access.php', loading: 'Chargement...',
        empty: 'Aucun acces.', loadFailed: 'Impossible de charger les acces:', missingEndpoint: 'Ajoute un endpoint JSON /admin_access.php pour activer cette page.',
        thResource: 'Ressource', thRole: 'Role', thDescription: 'Description',
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
      },
      myevents: {
        title: 'Gestion page MyEvents', refresh: 'Rafraichir events', list: 'Mes events', items: 'Contenu event',
        loading: 'Chargement...', noVisibleEvents: 'Aucun event visible.', noItems: 'Aucun item pour cet event.',
        loadItemsError: 'Erreur chargement items:', eventLabel: 'event',
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
      actions: { save: 'Save', logout: 'Logout', refresh: 'Refresh', delete: 'Delete', cancel: 'Cancel', reply: 'Reply' },
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
        title: 'Access management', expected: 'Expected endpoint: /admin_access.php', loading: 'Loading...',
        empty: 'No access entries.', loadFailed: 'Failed to load access entries:', missingEndpoint: 'Add a JSON endpoint /admin_access.php to enable this page.',
        thResource: 'Resource', thRole: 'Role', thDescription: 'Description',
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
      },
      myevents: {
        title: 'MyEvents page management', refresh: 'Refresh events', list: 'My events', items: 'Event content',
        loading: 'Loading...', noVisibleEvents: 'No visible events.', noItems: 'No items for this event.',
        loadItemsError: 'Failed to load items:', eventLabel: 'event',
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
      actions: { save: 'Opslaan', logout: 'Afmelden', refresh: 'Vernieuwen', delete: 'Verwijderen', cancel: 'Annuleren', reply: 'Beantwoorden' },
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
        title: 'Toegangsbeheer', expected: 'Verwacht endpoint: /admin_access.php', loading: 'Laden...',
        empty: 'Geen toegangsregels.', loadFailed: 'Toegang laden mislukt:', missingEndpoint: 'Voeg JSON-endpoint /admin_access.php toe om deze pagina te activeren.',
        thResource: 'Resource', thRole: 'Rol', thDescription: 'Beschrijving',
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
      },
      myevents: {
        title: 'MyEvents pagina beheer', refresh: 'Events vernieuwen', list: 'Mijn events', items: 'Eventinhoud',
        loading: 'Laden...', noVisibleEvents: 'Geen zichtbare events.', noItems: 'Geen items voor dit event.',
        loadItemsError: 'Items laden mislukt:', eventLabel: 'event',
      },
      common: { unknown: 'Onbekend', error: 'Fout' },
      toast: { apiSaved: 'API opgeslagen', loginOk: 'Succesvol aangemeld', logoutOk: 'Afgemeld', invalidSession: 'Ongeldige sessie. Meld opnieuw aan.' },
    },
  },
};

const state = {
  token: localStorage.getItem(STORAGE_KEYS.token) || '',
  apiBase: localStorage.getItem(STORAGE_KEYS.apiBase) || defaultApiBase,
  lang: localStorage.getItem(STORAGE_KEYS.lang) || 'fr',
  rooms: [],
  selectedRoomId: null,
  replyToMessage: null, // { id, author, text }
  events: [],
  selectedEventId: null,
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
  eventItemsTitle: document.getElementById('eventItemsTitle'),
  eventItemsContent: document.getElementById('eventItemsContent'),
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
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  if (state.token) {
    headers.set('Authorization', `Bearer ${state.token}`);
  }

  try {
    const response = await fetch(`${state.apiBase}${path}`, {
      ...options,
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

async function loadAccess() {
  els.accessContent.innerHTML = `<p class="hint">${escapeHtml(t('access.loading'))}</p>`;
  try {
    const response = await apiFetch('/admin_access.php');
    const rawAccess = Array.isArray(response) ? response : (response?.data ?? []);
    const data = normalizeKeys(rawAccess);
    
    if (!Array.isArray(data)) throw new Error('Unexpected format');

    const rows = data.map((a) => `
      <tr>
        <td>${escapeHtml(a.resource || a.scope || '')}</td>
        <td>${escapeHtml(a.role || '')}</td>
        <td>${escapeHtml(a.description || '')}</td>
      </tr>
    `).join('');

    els.accessContent.innerHTML = `
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>${escapeHtml(t('access.thResource'))}</th>
            <th>${escapeHtml(t('access.thRole'))}</th>
            <th>${escapeHtml(t('access.thDescription'))}</th>
          </tr></thead>
          <tbody>${rows || `<tr><td colspan="3">${escapeHtml(t('access.empty'))}</td></tr>`}</tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Error loading access:', error);
    els.accessContent.innerHTML = `
      <p class="hint">${escapeHtml(t('access.loadFailed'))} ${escapeHtml(error.message)}</p>
      <p class="hint">${escapeHtml(t('access.missingEndpoint'))}</p>
    `;
  }
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

function renderEvents() {
  els.eventsList.innerHTML = state.events.map((event) => `
    <li class="list-item ${String(event.id) === String(state.selectedEventId) ? 'active' : ''}" data-event-id="${escapeHtml(event.id)}">
      <div><strong>${escapeHtml(event.name || `Event ${event.id}`)}</strong></div>
      <div class="hint">${escapeHtml(event.startsAt || '')}</div>
    </li>
  `).join('');
}

async function loadEvents() {
  els.eventsList.innerHTML = `<li class="hint">${escapeHtml(t('myevents.loading'))}</li>`;
  try {
    const response = await apiFetch('/my_events.php');
    const rawEvents = Array.isArray(response) ? response : (response?.data ?? []);
    const events = normalizeKeys(rawEvents);
    state.events = Array.isArray(events) ? events : [];
    
    if (!state.selectedEventId && state.events[0]) {
      state.selectedEventId = state.events[0].id;
    }
    renderEvents();
    if (state.selectedEventId) {
      await loadEventItems(state.selectedEventId);
    } else {
      els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.noVisibleEvents'))}</p>`;
    }
  } catch (error) {
    console.error('Error loading events:', error);
    els.eventsList.innerHTML = `<li class="hint">${escapeHtml(t('common.error'))}: ${escapeHtml(error.message)}</li>`;
    els.eventItemsContent.innerHTML = '';
  }
}

async function loadEventItems(eventId) {
  els.eventItemsTitle.textContent = `${t('myevents.items')} #${eventId}`;
  els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.loading'))}</p>`;
  try {
    const response = await apiFetch(`/my_event_items.php?eventId=${encodeURIComponent(eventId)}`);
    const rawItems = Array.isArray(response) ? response : (response?.data ?? []);
    const items = normalizeKeys(rawItems);
    
    const blocks = (Array.isArray(items) ? items : []).map((item) => `
      <article class="list-item">
        <div class="item-badge">${escapeHtml(item.type || 'item')}</div>
        <h4>${escapeHtml(item.title || '(sans titre)')}</h4>
        <p>${escapeHtml(item.body || '')}</p>
      </article>
    `).join('');

    els.eventItemsContent.innerHTML = blocks || `<p class="hint">${escapeHtml(t('myevents.noItems'))}</p>`;
  } catch (error) {
    console.error('Error loading event items:', error);
    els.eventItemsContent.innerHTML = `<p class="hint">${escapeHtml(t('myevents.loadItemsError'))} ${escapeHtml(error.message)}</p>`;
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
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Connection error: Could not reach ${state.apiBase}/login.php. Make sure the API server is running and CORS is properly configured.`);
    }
    throw error;
  }
}

function logout() {
  state.token = '';
  state.rooms = [];
  state.selectedRoomId = null;
  state.events = [];
  state.selectedEventId = null;
  localStorage.removeItem(STORAGE_KEYS.token);
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
      await Promise.all([loadRooms(), loadEvents(), loadDashboard()]);
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
  els.refreshAccessBtn.addEventListener('click', () => void loadAccess());
  els.refreshRoomsBtn.addEventListener('click', () => void loadRooms());

  els.createRoomForm.addEventListener('submit', (event) => {
    event.preventDefault();
    void createRoom();
  });
  els.refreshEventsBtn.addEventListener('click', () => void loadEvents());

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
    const replyBtn = event.target.closest('[data-reply-message-id]');
    if (replyBtn) {
      setReply({
        id: replyBtn.dataset.replyMessageId,
        author: replyBtn.dataset.replyAuthor,
        text: replyBtn.dataset.replyText,
      });
    }
  });

  els.cancelReplyBtn.addEventListener('click', () => setReply(null));

  els.sendMessageBtn.addEventListener('click', () => void sendMessage());

  els.composeText.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void sendMessage();
    }
  });

  els.eventsList.addEventListener('click', (event) => {
    const item = event.target.closest('[data-event-id]');
    if (!item) return;
    state.selectedEventId = item.dataset.eventId;
    renderEvents();
    void loadEventItems(state.selectedEventId);
  });
}

async function refreshCurrentPage(forcedPage = null) {
  const activePage = forcedPage || document.querySelector('.tab.active')?.dataset.page || 'dashboard';

  if (activePage === 'dashboard') await loadDashboard();
  if (activePage === 'users') await loadUsers();
  if (activePage === 'access') await loadAccess();
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
    await Promise.all([loadRooms(), loadEvents(), loadDashboard()]);
  } catch {
    logout();
    toast(t('toast.invalidSession'), 'error');
  }
}

void boot();
