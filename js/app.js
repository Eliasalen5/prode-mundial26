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
      if (changed && !['/posiciones'].includes(getPage())) {
        render();
      }
    });
  }
}

// ============================================================
// CACHED USERS
// ============================================================
let _cachedUsersMap = null;

function loadCachedUsers() {
  if (_cachedUsersMap) {
    state.usersMap = Object.assign({}, _cachedUsersMap);
  } else {
    db.collection('users').get().then(snap => {
      state.usersMap = {};
      snap.docs.forEach(d => { state.usersMap[d.id] = d.data().username; });
      _cachedUsersMap = Object.assign({}, state.usersMap);
    });
  }
}

// ============================================================
// LEADERBOARD
// ============================================================
async function rebuildLeaderboard(predSnap) {
  if (!_cachedUsersMap) {
    const usersSnap = await db.collection('users').get();
    _cachedUsersMap = {};
    usersSnap.docs.forEach(d => { _cachedUsersMap[d.id] = d.data().username || d.id.slice(0,8); });
  }
  const usersMap = _cachedUsersMap;
  if (!predSnap) {
    predSnap = await db.collection('predictions').get();
  }

  state.allPredictions = [];
  predSnap.docs.forEach(d => {
    const p = d.data();
    const m = getMatchById(p.matchId);
    state.allPredictions.push({ id: d.id, ...p, matchday: m?.matchday });
  });

  const categories = [
    { key: '1', label: '📅 Fecha 1', matchdays: [1] },
    { key: '2', label: '📅 Fecha 2', matchdays: [2] },
    { key: '3', label: '📅 Fecha 3', matchdays: [3] },
    { key: 'elim', label: '🏆 Eliminatorias', matchdays: ['R32','R16','QF','SF','3rd','Final'] },
  ];

  state.leaderboardMD = categories.map(cat => {
    const catPoints = {};
    state.allPredictions.forEach(p => {
      if (!p.paid) return;
      if (!cat.matchdays.includes(p.matchday)) return;
      catPoints[p.userId] = (catPoints[p.userId] || 0) + (p.points || 0);
    });
    const catUsers = Object.keys(catPoints).map(uid => ({
      id: uid,
      username: usersMap[uid],
      points: catPoints[uid],
    })).sort((a, b) => b.points - a.points);
    return { key: cat.key, label: cat.label, matchdays: cat.matchdays, users: catUsers };
  });
}

function toggleLbSection(key) {
  state.collapsedGroups[key] = !state.collapsedGroups[key];
  render();
}

// ============================================================
// DATA LOADERS
// ============================================================
async function loadPredictionsForUser(uid) {
  const snap = await db.collection('predictions').where('userId', '==', uid).get();
  state.predictions = {};
  snap.docs.forEach(d => { state.predictions[d.data().matchId] = { id: d.id, ...d.data() }; });
}

async function loadPrizeData() {
  if (Object.keys(state.prizeData).length) return;
  try {
    const snap = await db.collection('predictions').where('paid', '==', true).get();
    const totals = { 1: 0, 2: 0, 3: 0 };
    snap.docs.forEach(d => {
      const p = d.data();
      const m = getMatchById(p.matchId);
      if (m && [1, 2, 3].includes(m.matchday)) {
        totals[m.matchday] += m.price || 500;
      }
    });
    state.prizeData = {
      1: Math.round(totals[1] * 0.8),
      2: Math.round(totals[2] * 0.8),
      3: Math.round(totals[3] * 0.8),
    };
    render();
  } catch (_) {}
}

// ============================================================
// BUSINESS HANDLERS
// ============================================================
function handlePay() {
  const unpaid = Object.entries(state.predictions).filter(([, p]) => !p.paid);
  if (unpaid.length === 0) return;
  const lines = unpaid.map(([matchId]) => {
    const m = getMatchById(matchId);
    return m ? `- ${m.homeTeam} vs ${m.awayTeam} ($${m.price})` : '';
  }).filter(Boolean);
  const total = unpaid.reduce((s, [matchId]) => {
    const m = getMatchById(matchId);
    return s + (m?.price || 500);
  }, 0);
  const username = state.userData?.username || state.user?.email || 'Usuario';
  const msg = encodeURIComponent(
    `Hola Elias, soy ${username}. Te voy a transferir $${total} por estos partidos:\n\n${lines.join('\n')}\n\nAlias: Eliasalen5 — Ahora te mando el comprobante.`
  );
  window.open(`https://wa.me/543329300352?text=${msg}`, '_blank');
}

async function handleSavePrediction(matchId) {
  if (!state.user) { showToast('⚠️ Iniciá sesión primero'); return; }
  const s = state.homeScores[matchId];
  if (!s || s.home === '' || s.away === '') { showToast('⚠️ Completá ambos marcadores'); return; }

  const match = getMatchById(matchId);
  if (!match) return;
  const matchDate = match.matchDate?.toDate ? match.matchDate.toDate() : new Date(match.date);
  if (matchDate.getTime() - Date.now() < 10 * 60 * 1000) {
    showToast('⏰ El partido ya está bloqueado (menos de 10 min)');
    return;
  }
  try {
    const docId = state.user.uid + '_' + matchId;
    const existing = state.predictions[matchId];
    const paid = existing?.paid || false;
    await db.collection('predictions').doc(docId).set({
      userId: state.user.uid,
      matchId: matchId,
      homeScore: Number(s.home),
      awayScore: Number(s.away),
      paid: paid,
      status: paid ? 'submitted' : 'pending',
      updatedAt: new Date(),
    }, { merge: true });
    await loadPredictionsForUser(state.user.uid);
    showToast('✅ Pronóstico guardado');
    render();
  } catch (e) {
    showToast('❌ Error al guardar: ' + e.message);
  }
}

async function handleConfirmPay(predId) {
  const predSnap = await db.collection('predictions').doc(predId).get();
  const pred = predSnap.data();
  const match = getMatchById(pred.matchId);
  const matchName = match ? `${match.homeTeam} vs ${match.awayTeam}` : pred.matchId;
  await db.collection('predictions').doc(predId).update({ paid: true, status: 'unlocked' });
  await db.collection('notifications').add({
    userId: pred.userId,
    message: `Tu pago para ${matchName} fue confirmado.`,
    read: false,
    createdAt: new Date(),
  });
  showToast('Pago confirmado');
  render();
}

async function handleClearResult(matchId) {
  if (!confirm('¿Eliminar resultado y resetear puntos de este partido?')) return;
  await db.collection('matches').doc(matchId).update({
    homeScore: null,
    awayScore: null,
    status: 'locked',
  });
  const predSnap = await db.collection('predictions').where('matchId', '==', matchId).get();
  const batch = db.batch();
  predSnap.docs.forEach(d => {
    batch.update(d.ref, { points: 0, status: 'pending' });
  });
  await batch.commit();
  const idx = state.matches.findIndex(m => m.id === matchId);
  if (idx !== -1) {
    state.matches[idx].homeScore = null;
    state.matches[idx].awayScore = null;
    state.matches[idx].status = 'locked';
  }
  showToast('🧹 Resultado limpiado');
  render();
}

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
    const match = getMatchById(matchId);
    const isFeatured = match?.featured;
    const exactPts = isFeatured ? 5 : 3;
    const winnerPts = isFeatured ? 2 : 1;
    const predSnap = await db.collection('predictions').get();
    const batch = db.batch();
    predSnap.docs.forEach(d => {
      const p = d.data();
      if (p.matchId !== matchId || !p.paid) return;
      let pts = 0;
      if (p.homeScore === Number(s.home) && p.awayScore === Number(s.away)) {
        pts = exactPts;
      } else if (Math.sign(p.homeScore - p.awayScore) === Math.sign(Number(s.home) - Number(s.away))) {
        pts = winnerPts;
      }
      batch.update(db.collection('predictions').doc(d.id), { points: pts, status: 'scored' });
    });
    await batch.commit();
    render();
  } catch (e) {
    showToast('❌ Error al guardar: ' + e.message);
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
  else if (action === 'pay') handlePay();
  else if (action === 'save-prediction') handleSavePrediction(e.target.dataset.matchId);
  else if (action === 'confirm-pay') handleConfirmPay(e.target.dataset.predId);
  else if (action === 'save-result') handleSaveResult(e.target.dataset.matchId);
  else if (action === 'clear-result') handleClearResult(e.target.dataset.matchId);
  else if (action === 'mark-all-notif-read') {
    state.notifications.filter(n => !n.read).forEach(n => {
      db.collection('notifications').doc(n.id).update({ read: true });
    });
  }
  else if (action === 'mark-notif-read') {
    db.collection('notifications').doc(e.target.dataset.notifId).update({ read: true });
  }
  else if (action === 'toggle-group') {
    const el = e.target.closest('[data-action="toggle-group"]');
    if (!el) return;
    const key = el.dataset.key;
    state.collapsedGroups[key] = !state.collapsedGroups[key];
    render();
  }
  else if (action === 'toggle-user') {
    const row = e.target.closest('[data-uid]');
    if (!row) return;
    const uid = row.dataset.uid;
    state.expandedUser = state.expandedUser === uid ? null : uid;
    render();
  }
  else if (action === 'toggle-lb-user') {
    const el = e.target.closest('[data-action="toggle-lb-user"]');
    if (!el) return;
    const lbKey = el.dataset.lbKey;
    state.expandedLbKey = state.expandedLbKey === lbKey ? '' : lbKey;
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
      document.getElementById('reg-username').value,
      document.getElementById('reg-email').value,
      document.getElementById('reg-pass').value,
      document.getElementById('reg-phone').value
    );
  }
});

document.getElementById('root').addEventListener('change', (e) => {
  const action = e.target.dataset.action;
  if (action === 'filter-historial') {
    state.selectedHistorialUser = e.target.value;
    render();
  }
  if (action === 'filter-pagos') {
    state.selectedPagosUser = e.target.value;
    render();
  }
  if (action === 'filter-posiciones') {
    state.selectedLeaderboardUser = e.target.value;
    state.expandedLbKey = '';
    render();
  }
  if (action === 'filter-pronosticos') {
    state.selectedPronosticosFilter = e.target.value;
    render();
  }
});

document.getElementById('root').addEventListener('input', (e) => {
  const action = e.target.dataset.action;
  if (!action) return;
  const matchId = e.target.dataset.matchId;
  if (!matchId) return;
  if (action === 'home-score' || action === 'away-score') {
    if (!state.homeScores[matchId]) state.homeScores[matchId] = { home: '', away: '' };
    if (action === 'home-score') state.homeScores[matchId].home = e.target.value;
    else state.homeScores[matchId].away = e.target.value;
  }
  if (action === 'admin-score-home' || action === 'admin-score-away') {
    if (!state.adminScores[matchId]) state.adminScores[matchId] = { home: '', away: '' };
    if (action === 'admin-score-home') state.adminScores[matchId].home = e.target.value;
    else state.adminScores[matchId].away = e.target.value;
  }
});

// ============================================================
// NAVIGATION & INIT
// ============================================================
window.addEventListener('hashchange', render);

// Hace que toggleLbSection sea accesible desde onclick en HTML
window.toggleLbSection = toggleLbSection;

initMatches();
render();
