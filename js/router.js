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
  if (page === '/admin/resultados' && state.userData?.role !== 'admin') {
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
  else if (page === '/admin/resultados') content = buildAdminResultados();
  else content = buildHome();

  document.getElementById('root').innerHTML = buildNavbar() + '<main class="main-content">' + content + '</main>';
}
