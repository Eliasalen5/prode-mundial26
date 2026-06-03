function buildNavbar() {
  const username = state.userData?.username || '';
  const isAdmin = state.userData?.role === 'admin';
  let html = `<nav class="navbar">
    <div class="navbar-top">
      <span class="navbar-brand">⚽ Prode 2026</span>`;
  if (state.user) {
    html += `<span class="navbar-user">${esc(username)}${isAdmin ? ' 👑' : ''} | <a href="#" data-action="logout">Salir</a></span>`;
  }
  html += `</div>
    <div class="navbar-links">
      <a href="#/" class="${getPage() === '/' ? 'active' : ''}">🏠 Fixture</a>
      <a href="#/grupos" class="${getPage() === '/grupos' ? 'active' : ''}">📋 Grupos</a>`;
  if (isAdmin) {
    html += `<a href="#/admin/resultados" class="${getPage() === '/admin/resultados' ? 'active' : ''}">📋 Resultados</a>`;
  }
  html += `</div>
  </nav>`;
  return html;
}

function buildLogin() {
  return `<div class="container" style="max-width:400px;margin:2rem auto">
    <h1>Iniciar Sesión</h1>
    ${state.error ? `<div class="alert alert-warning">${esc(state.error)}</div>` : ''}
    <form id="form-login">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="login-email" required placeholder="tu@email.com">
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" id="login-pass" required placeholder="••••••">
      </div>
      <button type="submit" class="btn btn-primary btn-block">Ingresar</button>
    </form>
    <div class="form-footer">¿No tenés cuenta? <a href="#/register">Registrarse</a></div>
  </div>`;
}

function buildRegister() {
  return `<div class="container" style="max-width:400px;margin:2rem auto">
    <h1>Registrarse</h1>
    ${state.error ? `<div class="alert alert-warning">${esc(state.error)}</div>` : ''}
    <form id="form-register">
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" id="reg-nombre" required placeholder="Juan">
      </div>
      <div class="form-group">
        <label>Apellido</label>
        <input type="text" id="reg-apellido" required placeholder="Pérez">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="reg-email" required placeholder="tu@email.com">
      </div>
      <div class="form-group">
        <label>Teléfono (WhatsApp)</label>
        <input type="tel" id="reg-phone" required placeholder="+54 11 1234-5678">
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" id="reg-pass" required placeholder="••••••" minlength="6">
      </div>
      <button type="submit" class="btn btn-primary btn-block">Crear cuenta</button>
    </form>
    <div class="form-footer">¿Ya tenés cuenta? <a href="#/login">Iniciar sesión</a></div>
  </div>`;
}

function buildHome() {
  let html = `<div class="container">
    <h1>Fixture Mundial 2026</h1>`;

  const ms = state.matches;
  if (!ms.length) {
    html += `<div class="alert alert-info">Cargando partidos...</div>`;
  } else {
    const fechas = { 1: [], 2: [], 3: [], elim: [] };
    ms.forEach(m => {
      if (m.stage === 'knockout') fechas.elim.push(m);
      else fechas[m.matchday].push(m);
    });

    [1, 2, 3].forEach(f => {
      const key = 'fecha_' + f;
      const isOpen = state.collapsedGroups[key] === true;
      html += `<div class="group-section">
        <h2 class="group-title" style="cursor:pointer" data-action="toggle-group" data-key="${esc(key)}">
          📅 Fecha ${f} <span style="float:right;font-size:0.85rem;color:#78909c">${isOpen ? '▲' : '▼'}</span>
        </h2>`;
      if (isOpen) {
        fechas[f].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => { html += buildMatchCard(m); });
      }
      html += `</div>`;
    });

    // Eliminatorias
    const elimMatches = fechas.elim;
    const allGroupsComplete = ms.filter(m => m.stage === 'group').every(m => m.homeScore != null);
    const isLocked = !allGroupsComplete || !ms.filter(m => m.stage === 'group').length;
    const elimKey = 'fecha_elim';
    const isElimOpen = state.collapsedGroups[elimKey] === true;
    html += `<div class="group-section">
      <h2 class="group-title" style="cursor:pointer" data-action="toggle-group" data-key="${esc(elimKey)}">
        🏆 Eliminatorias ${isLocked ? '🔒' : ''} <span style="float:right;font-size:0.85rem;color:#78909c">${isElimOpen ? '▲' : '▼'}</span>
      </h2>`;
    if (isElimOpen) {
      if (isLocked) {
        html += `<div style="padding:1rem;text-align:center;color:#546e7a;font-size:0.85rem">
          <p>🔒 Bloqueado hasta que se carguen todos los resultados de la Fase de Grupos</p>
        </div>`;
        elimMatches.forEach(m => {
          html += `<div class="match-card locked">
            <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</div>
            <div class="match-info">${formatDate(new Date(m.date))}</div>
            <span class="locked-badge">🔒</span>
          </div>`;
        });
      } else {
        const elimGroups = {};
        elimMatches.forEach(m => {
          if (!elimGroups[m.matchday]) elimGroups[m.matchday] = [];
          elimGroups[m.matchday].push(m);
        });
        ['16avos','8avos','Cuartos','Semis','3er puesto','Final'].forEach(key => {
          if (elimGroups[key]) {
            elimGroups[key].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => { html += buildMatchCard(m); });
          }
        });
      }
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}


function buildMatchCard(m) {
  const hasResult = m.homeScore != null;

  let html = `<div class="match-card${m.featured ? ' featured' : ''}">`;
  html += `<div class="match-teams">
    ${teamHTML(m.homeTeam)}
    <span class="vs">vs</span>
    ${teamHTML(m.awayTeam)}
    ${m.featured ? '<span class="featured-badge">🔥 Destacado</span>' : ''}
  </div>`;
  html += `<div class="match-info">${formatDate(new Date(m.date))}</div>`;

  if (hasResult) {
    html += `<div class="match-score">${m.homeScore} - ${m.awayScore}</div>`;
  }

  html += `</div>`;
  return html;
}

function buildGrupos() {
  const groupNames = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  const groups = {};
  groupNames.forEach(g => groups[g] = new Set());

  const groupMatches = {};
  groupNames.forEach(g => groupMatches[g] = []);

  state.matches.forEach(m => {
    if (m.stage === 'group' && groups[m.group]) {
      groups[m.group].add(m.homeTeam);
      groups[m.group].add(m.awayTeam);
      groupMatches[m.group].push(m);
    }
  });

  function calcStandings(matches, teamsArr) {
    const stats = {};
    teamsArr.forEach(t => stats[t] = { pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, dg:0, pts:0 });
    matches.forEach(m => {
      if (m.homeScore == null) return;
      const h = m.homeTeam, a = m.awayTeam;
      stats[h].pj++; stats[a].pj++;
      stats[h].gf += m.homeScore; stats[h].gc += m.awayScore;
      stats[a].gf += m.awayScore; stats[a].gc += m.homeScore;
      if (m.homeScore > m.awayScore) {
        stats[h].pg++; stats[a].pp++;
        stats[h].pts += 3;
      } else if (m.homeScore < m.awayScore) {
        stats[a].pg++; stats[h].pp++;
        stats[a].pts += 3;
      } else {
        stats[h].pe++; stats[a].pe++;
        stats[h].pts++; stats[a].pts++;
      }
    });
    Object.keys(stats).forEach(t => stats[t].dg = stats[t].gf - stats[t].gc);
    return teamsArr.map(t => ({ name: t, ...stats[t] }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  }

  let html = `<div class="container"><h1>Fase de Grupos</h1>
    <div class="grupos-grid">`;

  groupNames.forEach(g => {
    const teams = Array.from(groups[g]).sort();
    if (!teams.length) return;
    const standings = calcStandings(groupMatches[g], teams);
    html += `<div class="group-section grupo-card">
      <h2 class="group-title">Grupo ${g}</h2>
      <div class="standings-scroll">
      <table class="standings-table">
        <thead><tr>
          <th>#</th><th>Equipo</th><th>Pts</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th>
        </tr></thead><tbody>`;
    standings.forEach((t, i) => {
      html += `<tr class="${i === 0 && t.pts > 0 ? 'pos-1' : ''}">
        <td>${i + 1}</td>
        <td>${teamHTML(t.name)}</td>
        <td class="pts-cell">${t.pts}</td>
        <td>${t.pj}</td><td>${t.pg}</td><td>${t.pe}</td><td>${t.pp}</td>
      </tr>`;
    });
    html += `</tbody></table></div></div>`;
  });

  if (groupNames.every(g => !Array.from(groups[g]).length)) {
    html = `<div class="container"><h1>Fase de Grupos</h1>
      <div class="alert alert-info">Cargando grupos...</div></div>`;
  }

  html += `</div></div>`;
  return html;
}

function buildAdminResultados() {
  let html = `<div class="container"><h1>📋 Cargar Resultados</h1>`;
  const ms = state.matches;
  if (!ms.length) {
    html += `<div class="alert alert-info">Cargando partidos...</div>`;
  } else {
    const fechas = { 1: [], 2: [], 3: [], elim: [] };
    ms.forEach(m => {
      if (m.stage === 'knockout') fechas.elim.push(m);
      else fechas[m.matchday].push(m);
    });

    [1, 2, 3].forEach(f => {
      if (!fechas[f].length) return;
      html += `<div class="group-section">
        <h2 class="group-title">📅 Fecha ${f}</h2>`;
      fechas[f].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => {
        html += buildAdminMatchRow(m);
      });
      html += `</div>`;
    });

    // Eliminatorias
    const elimMatches = fechas.elim;
    const allGroupsComplete = ms.filter(m => m.stage === 'group').every(m => m.homeScore != null);
    const isLocked = !allGroupsComplete || !ms.filter(m => m.stage === 'group').length;
    if (elimMatches.length) {
      html += `<div class="group-section">
        <h2 class="group-title">🏆 Eliminatorias ${isLocked ? '🔒' : ''}</h2>`;
      if (isLocked) {
        html += `<div style="padding:1rem;text-align:center;color:#546e7a;font-size:0.85rem">
          <p>🔒 Bloqueado hasta que se carguen todos los resultados de la Fase de Grupos</p>
        </div>`;
        elimMatches.forEach(m => {
          html += `<div class="match-card locked">
            <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</div>
            <div class="match-info">${formatDate(new Date(m.date))}</div>
            <span class="locked-badge">🔒</span>
          </div>`;
        });
      } else {
        const elimGroups = {};
        elimMatches.forEach(m => {
          if (!elimGroups[m.matchday]) elimGroups[m.matchday] = [];
          elimGroups[m.matchday].push(m);
        });
        ['16avos','8avos','Cuartos','Semis','3er puesto','Final'].forEach(key => {
          if (elimGroups[key]) {
            elimGroups[key].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => {
              html += buildAdminMatchRow(m);
            });
          }
        });
      }
      html += `</div>`;
    }
  }
  html += `</div>`;
  return html;
}

function buildAdminMatchRow(m) {
  const hasResult = m.homeScore != null;
  let html = `<div class="match-card${m.featured ? ' featured' : ''}">`;
  html += `<div class="match-teams">
    ${teamHTML(m.homeTeam)} <span class="vs">vs</span> ${teamHTML(m.awayTeam)}
    ${m.featured ? '<span class="featured-badge">🔥</span>' : ''}
  </div>`;

  if (hasResult) {
    html += `<div class="match-score">${m.homeScore} - ${m.awayScore}</div>
      <button class="btn btn-danger btn-sm" data-action="clear-result" data-match-id="${esc(m.id)}">🗑️ Limpiar</button>`;
  } else {
    const s = state.adminScores[m.id] || { home: '', away: '' };
    html += `<div class="match-inputs">
      <input type="number" min="0" max="20" data-action="admin-score-home" data-match-id="${esc(m.id)}" value="${s.home}" placeholder="0" style="width:54px;padding:0.45rem 0.5rem;font-size:1rem">
      <span style="color:#546e7a;font-size:1rem">-</span>
      <input type="number" min="0" max="20" data-action="admin-score-away" data-match-id="${esc(m.id)}" value="${s.away}" placeholder="0" style="width:54px;padding:0.45rem 0.5rem;font-size:1rem">
      <button class="btn btn-primary btn-sm" data-action="save-result" data-match-id="${esc(m.id)}">Guardar</button>
    </div>`;
  }

  html += `</div>`;
  return html;
}

function formatDate(d) {
  const opts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleDateString('es-ES', opts);
}
