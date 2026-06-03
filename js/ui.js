function buildNavbar() {
  const username = state.userData?.username || '';
  const isAdmin = state.userData?.role === 'admin';
  const unread = state.notifications.filter(n => !n.read).length;
  let html = `<nav class="navbar">
    <div class="navbar-top">
      <span class="navbar-brand">⚽ Prode 2026</span>`;
  if (state.user) {
    html += `<span class="navbar-user">${esc(username)}${isAdmin ? ' 👑' : ''} | <a href="#" data-action="logout">Salir</a></span>`;
  }
  html += `</div>
    <div class="navbar-links">
      <a href="#/" class="${getPage() === '/' ? 'active' : ''}">🏠 Fixture</a>
      <a href="#/grupos" class="${getPage() === '/grupos' ? 'active' : ''}">📋 Grupos</a>
      <a href="#/notificaciones" class="${getPage() === '/notificaciones' ? 'active' : ''}">🔔 Notificaciones${unread ? ` <span class="notif-badge">${unread}</span>` : ''}</a>`;
  if (isAdmin) {
    html += `<a href="#/admin/pagos" class="${getPage() === '/admin/pagos' ? 'active' : ''}">💵 Pagos</a>`;
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
      const isPaid = state.fechaPaid[f];
      html += `<div class="group-section">
        <h2 class="group-title" style="cursor:pointer" data-action="toggle-group" data-key="${esc(key)}">
          📅 Fecha ${f} <span style="float:right;font-size:0.85rem;color:#78909c">${isOpen ? '▲' : '▼'}</span>
        </h2>`;
      if (state.user && !isPaid) {
        html += `<div class="pay-banner">
          <span style="color:#ffd54f">🔒 Pagá $${state.fechaPrice.toLocaleString()} para Fecha ${f}</span>
          <button class="btn btn-success btn-sm" style="margin-left:0.5rem" data-action="pay-fecha" data-fecha="${f}">💵 Pagar por WhatsApp</button>
        </div>`;
      } else if (state.user && isPaid) {
        html += `<div class="pay-banner" style="color:#4caf50">✅ Fecha ${f} pagada</div>`;
      }
      if (isOpen) {
        const isLocked = state.user && !isPaid;
        fechas[f].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => { html += buildMatchCard(m, isLocked); });
      }
      html += `</div>`;
    });

    // Eliminatorias
    const elimMatches = fechas.elim;
    const allGroupsComplete = ms.filter(m => m.stage === 'group').every(m => m.homeScore != null);
    const isLocked = !allGroupsComplete || !ms.filter(m => m.stage === 'group').length;
    const elimKey = 'fecha_elim';
    const isElimOpen = state.collapsedGroups[elimKey] === true;
    const isElimPaid = state.fechaPaid['elim'];
    html += `<div class="group-section">
      <h2 class="group-title" style="cursor:pointer" data-action="toggle-group" data-key="${esc(elimKey)}">
        🏆 Eliminatorias ${isLocked ? '🔒' : ''} <span style="float:right;font-size:0.85rem;color:#78909c">${isElimOpen ? '▲' : '▼'}</span>
      </h2>`;
    if (state.user && !isElimPaid) {
      html += `<div class="pay-banner">
        <span style="color:#ffd54f">🔒 Pagá $${state.fechaPrice.toLocaleString()} para Eliminatorias</span>
        <button class="btn btn-success btn-sm" style="margin-left:0.5rem" data-action="pay-fecha" data-fecha="elim">💵 Pagar por WhatsApp</button>
      </div>`;
    } else if (state.user && isElimPaid) {
      html += `<div class="pay-banner" style="color:#4caf50">✅ Eliminatorias pagadas</div>`;
    }
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
        const elimLocked = state.user && !isElimPaid;
        const elimGroups = {};
        elimMatches.forEach(m => {
          if (!elimGroups[m.matchday]) elimGroups[m.matchday] = [];
          elimGroups[m.matchday].push(m);
        });
        ['16avos','8avos','Cuartos','Semis','3er puesto','Final'].forEach(key => {
          if (elimGroups[key]) {
            elimGroups[key].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => { html += buildMatchCard(m, elimLocked); });
          }
        });
      }
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}


function buildMatchCard(m, isLocked) {
  const hasResult = m.homeScore != null;

  let html = `<div class="match-card${m.featured ? ' featured' : ''}${isLocked ? ' locked' : ''}">`;
  html += `<div class="match-teams">
    ${teamHTML(m.homeTeam)}
    <span class="vs">vs</span>
    ${teamHTML(m.awayTeam)}
    ${m.featured ? '<span class="featured-badge">🔥 Destacado</span>' : ''}
  </div>`;
  html += `<div class="match-info">${formatDate(new Date(m.date))}</div>`;

  if (hasResult) {
    html += `<div class="match-score">${m.homeScore} - ${m.awayScore}</div>`;
  } else if (isLocked) {
    html += `<span class="locked-badge">🔒</span>`;
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

function buildNotificaciones() {
  let html = `<div class="container"><h1>Notificaciones</h1>`;
  const unread = state.notifications.filter(n => !n.read);
  if (unread.length) {
    html += `<button class="btn btn-primary btn-sm" style="margin-bottom:0.8rem" data-action="mark-all-notif-read">Marcar todas leídas</button>`;
  }
  if (!state.notifications.length) {
    html += `<div class="alert alert-info">No tenés notificaciones</div>`;
  } else {
    state.notifications.forEach(n => {
      html += `<div class="notif-item ${n.read ? 'read' : 'unread'}" data-action="mark-notif-read" data-notif-id="${esc(n.id)}">
        <span class="notif-msg">${esc(n.message)}</span>
        <span class="notif-date">${n.createdAt?.toDate ? formatDate(n.createdAt.toDate()) : ''}</span>
      </div>`;
    });
  }
  html += `</div>`;
  return html;
}

function buildAdminPagos() {
  let html = `<div class="container"><h1>💵 Pagos Pendientes</h1>`;

  const rows = [];
  Object.keys(state.usersMap).forEach(uid => {
    const fs = state.fechaStatus[uid] || {};
    ['1', '2', '3', 'elim'].forEach(fk => {
      if (!fs[fk]) {
        rows.push({ uid, username: state.usersMap[uid] || uid.slice(0,8), fechaKey: fk });
      }
    });
  });

  if (rows.length) {
    html += `<select class="filter-select" data-action="filter-pagos">
      <option value="">Todos los participantes</option>`;
    const seen = {};
    rows.forEach(r => {
      if (!seen[r.uid]) { seen[r.uid] = true;
        html += `<option value="${esc(r.uid)}" ${state.selectedPagosUser === r.uid ? 'selected' : ''}>${esc(r.username)}</option>`;
      }
    });
    html += `</select>`;
  }

  const filtered = state.selectedPagosUser ? rows.filter(r => r.uid === state.selectedPagosUser) : rows;

  if (!filtered.length) {
    html += `<div class="alert alert-info">Sin pagos pendientes</div>`;
  } else {
    filtered.forEach(r => {
      const label = r.fechaKey === 'elim' ? 'Eliminatorias' : 'Fecha ' + r.fechaKey;
      html += `<div class="match-card" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
        <span><strong>${esc(r.username)}</strong> — ${label}</span>
        <button class="btn btn-success btn-sm" data-action="confirm-fecha-pay" data-uid="${esc(r.uid)}" data-fecha="${esc(r.fechaKey)}">✅ Confirmar pago $${state.fechaPrice.toLocaleString()}</button>
      </div>`;
    });
  }

  html += `<div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #1e3a4a">
    <button class="btn btn-warning btn-sm" data-action="reset-my-pagos">🔄 Resetear mis pagos</button>
    <span style="color:#ffd54f;font-size:0.75rem;margin-left:0.5rem">Pone tus fechas como impagas (para probar)</span>
  </div>`;
  html += `</div>`;
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
