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
