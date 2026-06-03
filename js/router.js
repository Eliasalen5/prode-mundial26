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
  if (['/admin/pagos', '/admin/resultados'].includes(page) && state.userData?.role !== 'admin') {
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
  else if (page === '/grupos') content = buildGrupos();
  else if (page === '/pronosticos') content = buildPronosticos();
  else if (page === '/notificaciones') content = buildNotificaciones();
  else if (page === '/admin/pagos') content = buildAdminPagos();
  else if (page === '/admin/resultados') content = buildAdminResultados();
  else content = buildHome();

  document.getElementById('root').innerHTML = buildNavbar() + '<main class="main-content">' + content + '</main>';

  // Admin pagos listener
  if (page === '/admin/pagos' && !unsubPagos) {
    loadCachedUsers();
    unsubPagos = db.collection('users').onSnapshot(() => {
      loadCachedUsers();
      render();
    });
  }

  // Predictions listener (home + pronosticos)
  if ((page === '/' || page === '/pronosticos') && !unsubPredictions && state.user) {
    unsubPredictions = db.collection('predictions').where('userId', '==', state.user.uid).onSnapshot(snap => {
      state.predictions = {};
      snap.docs.forEach(d => { state.predictions[d.data().matchId] = { id: d.id, ...d.data() }; });
      render();
    });
  }

  // Notifications listener (always on)
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
        }
        render();
      }, (err) => console.error('Notif error:', err));
  }
}
