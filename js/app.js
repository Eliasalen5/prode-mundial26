// ============================================================
// MATCHES FROM SEED + SCORES FROM FIRESTORE
// ============================================================
function initMatches() {
  if (state.matches.length > 0) return;
  state.matches = getSeedData();
  if (!unsubScores) {
    unsubScores = db.collection('matches').onSnapshot(snap => {
      let changed = false;
      snap.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          const idx = state.matches.findIndex(m => m.id === change.doc.id);
          if (idx !== -1) {
            const oldHome = state.matches[idx].homeScore;
            const oldAway = state.matches[idx].awayScore;
            state.matches[idx].homeScore = data.homeScore != null ? data.homeScore : null;
            state.matches[idx].awayScore = data.awayScore != null ? data.awayScore : null;
            state.matches[idx].status = data.status || 'locked';
            if ((oldHome ?? null) !== state.matches[idx].homeScore || (oldAway ?? null) !== state.matches[idx].awayScore) {
              changed = true;
            }
          }
        }
      });
      if (changed) render();
    });
  }
}

let _cachedUsersMap = null;

// ============================================================
// CACHED USERS (for admin pagos)
// ============================================================
function loadCachedUsers() {
  if (_cachedUsersMap) {
    state.usersMap = Object.assign({}, _cachedUsersMap);
  } else {
    db.collection('users').get().then(snap => {
      state.usersMap = {};
      state.fechaStatus = {};
      snap.docs.forEach(d => {
        state.usersMap[d.id] = d.data().username;
        state.fechaStatus[d.id] = d.data().fechaPaid || {};
      });
      _cachedUsersMap = Object.assign({}, state.usersMap);
    }).catch(() => {});
  }
}

// ============================================================
// ADMIN: SAVE / CLEAR RESULTS
// ============================================================
async function handleSaveResult(matchId) {
  const s = state.adminScores[matchId];
  if (!s || s.home === '' || s.away === '') return;
  try {
    await db.collection('matches').doc(matchId).set({
      homeScore: Number(s.home),
      awayScore: Number(s.away),
      status: 'played',
    }, { merge: true });
    const idx = state.matches.findIndex(m => m.id === matchId);
    if (idx !== -1) {
      state.matches[idx].homeScore = Number(s.home);
      state.matches[idx].awayScore = Number(s.away);
      state.matches[idx].status = 'played';
    }
    showToast('✅ Resultado guardado');
    render();
  } catch (e) {
    showToast('❌ Error: ' + e.message);
  }
}

async function handleClearResult(matchId) {
  if (!confirm('¿Eliminar resultado de este partido?')) return;
  try {
    await db.collection('matches').doc(matchId).update({
      homeScore: null,
      awayScore: null,
      status: 'locked',
    });
    const idx = state.matches.findIndex(m => m.id === matchId);
    if (idx !== -1) {
      state.matches[idx].homeScore = null;
      state.matches[idx].awayScore = null;
      state.matches[idx].status = 'locked';
    }
    showToast('🧹 Resultado limpiado');
    render();
  } catch (e) {
    showToast('❌ Error: ' + e.message);
  }
}

// ============================================================
// PAYMENT HANDLERS
// ============================================================
function handlePayFecha(fechaKey) {
  if (state.fechaPaid[fechaKey]) return;
  const label = fechaKey === 'elim' ? 'Eliminatorias' : 'Fecha ' + fechaKey;
  const username = state.userData?.username || state.user?.email || 'Usuario';
  const msg = encodeURIComponent(
    `Hola Elias, soy ${username}. Te voy a transferir $${state.fechaPrice.toLocaleString()} para ${label}, ahora te paso el comprobante.`
  );
  window.open(`https://wa.me/543329300352?text=${msg}`, '_blank');
}

async function handleConfirmFechaPay(uid, fechaKey) {
  try {
    await db.collection('users').doc(uid).update({ [`fechaPaid.${fechaKey}`]: true });
    if (state.user?.uid === uid) state.fechaPaid[fechaKey] = true;
    if (!state.fechaStatus[uid]) state.fechaStatus[uid] = {};
    state.fechaStatus[uid][fechaKey] = true;
    const username = state.usersMap[uid] || uid.slice(0, 8);
    const isElim = fechaKey === 'elim';
    const fechaLabel = isElim ? 'Eliminatorias' : 'Fecha ' + fechaKey;
    await db.collection('notifications').add({
      userId: uid,
      message: `✅ Pago confirmado para ${fechaLabel} ($${state.fechaPrice.toLocaleString()}). Ya podés cargar tus pronósticos.`,
      read: false,
      createdAt: new Date(),
    });
    showToast(`✅ ${fechaLabel} confirmado para ${username}`);
    render();
  } catch (e) {
    showToast('❌ Error: ' + e.message);
  }
}

async function handleResetMyPagos() {
  if (!state.user) return;
  try {
    await db.collection('users').doc(state.user.uid).update({
      fechaPaid: { '1': false, '2': false, '3': false, 'elim': false }
    });
    state.fechaPaid = { '1': false, '2': false, '3': false, 'elim': false };
    showToast('🔄 Tus fechas ahora están como impagas');
    render();
  } catch (e) {
    showToast('❌ Error: ' + e.message);
  }
}

function showToast(msg) {
  const existing = document.getElementById('toast-container');
  if (existing) existing.remove();
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;max-width:360px;width:100%';
  const div = document.createElement('div');
  div.style.cssText = 'background:#1a2a3e;color:#e0e0e0;padding:1rem 1.2rem;border-radius:8px;border-left:4px solid #4caf50;box-shadow:0 4px 20px rgba(0,0,0,0.4);font-size:0.9rem;animation:slideIn 0.3s ease';
  div.textContent = msg;
  container.appendChild(div);
  document.body.appendChild(container);
  setTimeout(() => { container.style.transition = 'opacity 0.3s'; container.style.opacity = '0'; setTimeout(() => container.remove(), 300); }, 4000);
}

// ============================================================
// EVENT DELEGATION
// ============================================================
document.getElementById('root').addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  e.preventDefault();

  if (action === 'logout') handleLogout();
  else if (action === 'toggle-group') {
    const el = e.target.closest('[data-action="toggle-group"]');
    if (!el) return;
    const key = el.dataset.key;
    state.collapsedGroups[key] = !state.collapsedGroups[key];
    render();
  }
  else if (action === 'pay-fecha') handlePayFecha(e.target.dataset.fecha);
  else if (action === 'confirm-fecha-pay') handleConfirmFechaPay(e.target.dataset.uid, e.target.dataset.fecha);
  else if (action === 'reset-my-pagos') handleResetMyPagos();
  else if (action === 'save-result') handleSaveResult(e.target.dataset.matchId);
  else if (action === 'clear-result') handleClearResult(e.target.dataset.matchId);
  else if (action === 'mark-all-notif-read') {
    state.notifications.filter(n => !n.read).forEach(n => {
      db.collection('notifications').doc(n.id).update({ read: true });
    });
  }
  else if (action === 'mark-notif-read') {
    const id = e.target.closest('[data-notif-id]')?.dataset.notifId;
    if (id) db.collection('notifications').doc(id).update({ read: true });
  }
});

document.getElementById('root').addEventListener('input', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const matchId = e.target.dataset.matchId;
  if (!matchId) return;
  if (action === 'admin-score-home' || action === 'admin-score-away') {
    if (!state.adminScores[matchId]) state.adminScores[matchId] = { home: '', away: '' };
    if (action === 'admin-score-home') state.adminScores[matchId].home = e.target.value;
    else state.adminScores[matchId].away = e.target.value;
  }
});

document.getElementById('root').addEventListener('change', (e) => {
  const action = e.target.dataset.action;
  if (action === 'filter-pagos') {
    state.selectedPagosUser = e.target.value;
    render();
  }
});

document.getElementById('root').addEventListener('submit', (e) => {
  if (e.target.id === 'form-login') {
    e.preventDefault();
    handleLogin(document.getElementById('login-email').value, document.getElementById('login-pass').value);
  }
  if (e.target.id === 'form-register') {
    e.preventDefault();
    handleRegister(
      document.getElementById('reg-nombre').value,
      document.getElementById('reg-apellido').value,
      document.getElementById('reg-email').value,
      document.getElementById('reg-pass').value,
      document.getElementById('reg-phone').value
    );
  }
});

// ============================================================
// NAVIGATION & INIT
// ============================================================
window.addEventListener('hashchange', render);

initMatches();
render();
