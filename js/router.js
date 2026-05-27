function render() {
  if (state.loading) {
    document.getElementById('root').innerHTML = '<div class="loading">Cargando...</div>';
    return;
  }

  const page = getPage();
  const publicPages = ['/login', '/register'];

  if (!state.user && !publicPages.includes(page)) {
    cleanupListeners();
    currentPage = '/login';
    navigate('/login');
    return;
  }
  if (state.user && publicPages.includes(page)) {
    cleanupListeners();
    currentPage = '/';
    navigate('/');
    return;
  }
  if (['/admin/pagos','/admin/resultados','/admin/historial','/seed'].includes(page) && state.userData?.role !== 'admin') {
    cleanupListeners();
    currentPage = '/';
    navigate('/');
    return;
  }

  if (page !== currentPage) {
    cleanupListeners();
    currentPage = page;
  }

  let content = '';
  if (page === '/login') content = buildLogin();
  else if (page === '/register') content = buildRegister();
  else if (page === '/pronosticos') content = buildPronosticos();
  else if (page === '/posiciones') content = buildPosiciones();
  else if (page === '/notificaciones') content = buildNotificaciones();
  else if (page === '/admin/pagos') content = buildAdminPagos();
  else if (page === '/admin/resultados') content = buildAdminResultados();
  else if (page === '/admin/historial') content = buildAdminHistorial();
  else if (page === '/seed') content = buildSeed();
  else content = buildHome();

  document.getElementById('root').innerHTML = buildNavbar() + '<main class="main-content">' + content + '</main>';

  // Home page listeners
  if (page === '/' && !unsubMatches) {
    unsubMatches = db.collection('matches').orderBy('matchDate').onSnapshot(async (snap) => {
      state.matches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (state.user) await loadPredictionsForUser(state.user.uid);
      render();
    });
  }
  if (page === '/' && !unsubPredictions && state.user) {
    unsubPredictions = db.collection('predictions').where('userId', '==', state.user.uid).onSnapshot(async (snap) => {
      state.predictions = {};
      snap.docs.forEach(d => { state.predictions[d.data().matchId] = { id: d.id, ...d.data() }; });
      render();
    });
  }

  // Pronosticos page
  if (page === '/pronosticos' && !unsubPredictions && state.user) {
    unsubPredictions = db.collection('predictions').where('userId', '==', state.user.uid).onSnapshot(async (snap) => {
      state.predictions = {};
      snap.docs.forEach(d => { state.predictions[d.data().matchId] = { id: d.id, ...d.data() }; });
      render();
    });
  }

  // Admin pagos
  if (page === '/admin/pagos' && !unsubPagos) {
    loadCachedUsers();
    unsubPagos = db.collection('predictions').where('paid', '==', false).onSnapshot((snap) => {
      state.pendingPagos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      render();
    });
  }

  // Admin historial
  if (page === '/admin/historial' && !unsubPagos) {
    loadCachedUsers();
    if (!unsubMatches) {
      unsubMatches = db.collection('matches').orderBy('matchDate').onSnapshot((snap) => {
        state.matches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      });
    }
    unsubPagos = db.collection('predictions').onSnapshot((snap) => {
      state.paidHistory = snap.docs.filter(d => d.data().paid).map(d => ({ id: d.id, ...d.data() }));
      render();
    });
  }

  // Admin resultados
  if (page === '/admin/resultados' && !unsubMatches) {
    unsubMatches = db.collection('matches').orderBy('matchDate').onSnapshot((snap) => {
      state.matches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      render();
    });
  }

  // Posiciones (leaderboard)
  if (page === '/posiciones') {
    if (!unsubMatches) {
      unsubMatches = db.collection('matches').orderBy('matchDate').onSnapshot((snap) => {
        state.matches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (getPage() === '/posiciones') render();
      });
    }
    if (!unsubLeaderboard) {
      unsubLeaderboard = db.collection('predictions').onSnapshot(async (snap) => {
        await rebuildLeaderboard(snap);
        if (getPage() === '/posiciones') render();
      });
    }
  }

  // Prize data for home
  if (page === '/' && state.matches.length && !Object.keys(state.prizeData).length) {
    loadPrizeData();
  }

  // Notification listener (always on)
  if (state.user && !unsubNotifications) {
    unsubNotifications = db.collection('notifications')
      .where('userId', '==', state.user.uid)
      .onSnapshot((snap) => {
        const prevCount = state.notifications.length;
        state.notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        if (state.notifications.length > prevCount && prevCount > 0) {
          const newest = state.notifications[0];
          if (newest && !newest.read) showToast(newest.message);
          state.lastNotifCount = state.notifications.length;
          render();
        } else if (getPage() !== '/posiciones') {
          render();
        } else {
          const badge = document.getElementById('notif-badge');
          const unread = state.notifications.filter(n => !n.read).length;
          if (badge) {
            badge.textContent = unread;
            badge.style.display = unread ? 'inline' : 'none';
          }
        }
      }, (err) => console.error('Notif error:', err));
  }
}
