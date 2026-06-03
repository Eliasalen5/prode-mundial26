function buildNavbar() {
  const page = getPage();
  const unread = state.notifications.filter(n => !n.read).length;
  const username = state.userData?.username || '';
  const isAdmin = state.userData?.role === 'admin';
  const menu = [
    { href: '/', label: '🏠 Fixture', admin: false },
    { href: '/posiciones', label: '📊 Posiciones', admin: false },
    { href: '/pronosticos', label: '📝 Pronósticos', admin: false },
    { href: '/notificaciones', label: '🔔 Notificaciones' + (unread ? ` <span class="notif-badge" id="notif-badge">${unread}</span>` : ''), admin: false },
  ];
  if (isAdmin) {
    menu.push({ href: '/admin/resultados', label: '📋 Resultados', admin: true });
  }
  let html = `<nav class="navbar">
    <div class="navbar-top">
      <span class="navbar-brand">⚽ Prode 2026</span>
      <span class="navbar-user">${esc(username)} ${isAdmin ? '👑' : ''} | <a href="#" data-action="logout">Salir</a></span>
    </div>
    <div class="navbar-links">`;
  menu.forEach(m => {
    const active = page === m.href ? ' active' : '';
    html += `<a href="#${m.href}" class="${active}">${m.label}</a>`;
  });
  html += `</div></nav>`;
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
  html += `<div class="info-banner">
    <strong>💰 Puntajes:</strong><br>
    Partidos comunes: 3 pts resultado exacto / 1 pt ganador o empate.<br>
    Partidos <strong>Destacados</strong> 🔥: 5 pts resultado exacto / 2 pts ganador o empate.<br>
    ⏰ Los pronósticos se cierran <strong>10 minutos antes</strong> del inicio de cada partido.<br>
  </div>`;

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
          const p = state.predictions[m.id];
          html += `<div class="match-card locked">
            <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</div>
            <div class="match-info">${formatDate(new Date(m.date))}</div>
            <span class="locked-badge">🔒</span>
            ${p ? `<div style="font-size:0.75rem;margin-top:0.2rem;text-align:center">${p.homeScore}-${p.awayScore}</div>` : ''}
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
  const isFeatured = m.featured;
  const pred = state.predictions[m.id];
  const hasResult = m.homeScore != null;
  const now = new Date();
  const matchDate = m.matchDate?.toDate ? m.matchDate.toDate() : new Date(m.date);
  const isLocked = (matchDate.getTime() - now.getTime()) < 10 * 60 * 1000;

  let html = `<div class="match-card${(isLocked && !hasResult) ? ' locked' : ''}${isFeatured ? ' featured' : ''}">`;
  html += `<div class="match-teams">
    ${teamHTML(m.homeTeam)}
    <span class="vs">vs</span>
    ${teamHTML(m.awayTeam)}
    ${isFeatured ? '<span class="featured-badge">🔥 Destacado</span>' : ''}
  </div>`;
  html += `<div class="match-info">${formatDate(matchDate)}</div>`;

  if (hasResult) {
    html += `<div class="match-score">${m.homeScore} - ${m.awayScore}</div>`;
    if (pred && pred.points != null) {
      const ptsColor = pred.points >= 3 ? '#4caf50' : pred.points >= 1 ? '#ffd54f' : '#78909c';
      html += `<div style="font-size:0.8rem;color:${ptsColor};font-weight:700">+${pred.points} pts</div>`;
    }
  }

  if (state.user && !hasResult) {
    if (!isLocked) {
      const hs = state.homeScores[m.id] || (pred ? { home: pred.homeScore, away: pred.awayScore } : { home: '', away: '' });
      html += `<div class="match-inputs">
        <input type="number" min="0" max="20" data-action="home-score" data-match-id="${esc(m.id)}" value="${hs.home}" placeholder="0">
        <span style="color:#546e7a">-</span>
        <input type="number" min="0" max="20" data-action="away-score" data-match-id="${esc(m.id)}" value="${hs.away}" placeholder="0">
        <button class="btn btn-primary btn-sm" data-action="save-prediction" data-match-id="${esc(m.id)}">Guardar</button>
      </div>`;
    } else if (pred) {
      html += `<div class="match-pred">${pred.homeScore} - ${pred.awayScore} <span class="locked-badge">🔒</span></div>`;
    } else {
      html += `<div style="text-align:center;padding:0.5rem;color:#546e7a;font-size:0.8rem">🔒 Sin pronóstico</div>`;
    }
  }

  html += `</div>`;
  return html;
}

function formatDate(d) {
  const opts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleDateString('es-ES', opts);
}

function buildPronosticos() {
  let html = `<div class="container">
    <h1>Mis Pronósticos</h1>`;

  const preds = Object.values(state.predictions);
  if (!preds.length) {
    html += `<div class="alert alert-info">Todavía no cargaste ningún pronóstico. Andá al <a href="#/">Fixture</a> para empezar.</div>`;
    html += `</div>`;
    return html;
  }

  // Filter by matchday
  const matchdays = {};
  preds.forEach(p => {
    const m = getMatchById(p.matchId);
    const md = m?.matchday || '?';
    if (!matchdays[md]) matchdays[md] = [];
    matchdays[md].push({ ...p, match: m });
  });
  const mdKeys = Object.keys(matchdays).sort();

  html += `<select class="filter-select" data-action="filter-pronosticos">
    <option value="">Todas las fechas</option>`;
  mdKeys.forEach(k => {
    const label = isNaN(k) ? k : 'Fecha ' + k;
    html += `<option value="${esc(k)}" ${state.selectedPronosticosFilter === k ? 'selected' : ''}>${label}</option>`;
  });
  html += `</select>`;

  const filter = state.selectedPronosticosFilter || '';
  mdKeys.forEach(k => {
    if (filter && filter !== k) return;
    const label = isNaN(k) ? k : '📅 Fecha ' + k;
    html += `<div class="group-section"><h2 class="group-title" style="cursor:default">${label}</h2>`;
    const items = matchdays[k].sort((a, b) => (a.match?.matchDate?.toDate?.() || 0) - (b.match?.matchDate?.toDate?.() || 0));
    items.forEach(p => {
      const m = p.match;
      if (!m) return;
      const realScore = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : '-';
      html += `<div class="match-card">
        <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</div>
        <div class="match-pred">${p.homeScore} - ${p.awayScore}</div>
        <div style="font-size:0.8rem;color:#90a4ae">→ ${realScore}</div>`;
      if (p.points != null) {
        const c = p.points >= 3 ? '#4caf50' : p.points >= 1 ? '#ffd54f' : '#78909c';
        html += `<div style="font-size:0.85rem;color:${c};font-weight:700">+${p.points}</div>`;
      }
      html += `</div>`;
    });
    html += `</div>`;
  });

  html += `</div>`;
  return html;
}

function buildPosiciones() {
  let html = `<div class="container"><h1>Posiciones</h1>`;
  const md = state.leaderboardMD;

  // Filter dropdown
  const allUsers = [];
  const seen = {};
  md.forEach(cat => cat.users.forEach(u => {
    if (!seen[u.id]) { seen[u.id] = true; allUsers.push({ id: u.id, username: u.username }); }
  }));
  allUsers.sort((a, b) => (a.username || '').localeCompare(b.username || ''));

  html += `<select class="filter-select" data-action="filter-posiciones">
    <option value="">Todos los participantes</option>`;
  allUsers.forEach(u => {
    html += `<option value="${esc(u.id)}" ${state.selectedLeaderboardUser === u.id ? 'selected' : ''}>${esc(u.username)}</option>`;
  });
  html += `</select>`;

  // Single user view
  const selUid = state.selectedLeaderboardUser;
  if (selUid) {
    const selUser = allUsers.find(u => u.id === selUid);
    const userPreds = state.allPredictions.filter(p => p.userId === selUid);
    const sortedPreds = userPreds.map(p => ({ ...p, match: getMatchById(p.matchId) }))
      .filter(p => p.match)
      .sort((a, b) => new Date(a.match.date) - new Date(b.match.date));
    if (!sortedPreds.length) {
      html += `<div class="alert alert-info">${esc(selUser?.username || 'Usuario')} no tiene pronósticos</div>`;
    } else {
      let totalPts = 0;
      sortedPreds.forEach(p => { totalPts += p.points || 0; });
      html += `<div class="group-section">
        <h2 class="group-title" style="cursor:default">${esc(selUser?.username || '')} — Total: ${totalPts} pts</h2>
        <div style="padding:0.5rem;overflow-x:auto">
        <table>
          <thead><tr style="color:#78909c">
            <th>Partido</th><th>Fecha</th><th>Pronóstico</th><th>Resultado</th><th>Pts</th>
          </tr></thead><tbody>`;
      sortedPreds.forEach(p => {
        const m = p.match;
        const realScore = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : '-';
        const pts = p.points || 0;
        const ptsColor = pts >= 3 ? '#4caf50' : pts >= 1 ? '#ffd54f' : '#78909c';
        html += `<tr>
          <td>${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</td>
          <td style="text-align:center;color:#90a4ae">${esc(m.matchday)}</td>
          <td style="text-align:center;color:#4fc3f7">${p.homeScore} - ${p.awayScore}</td>
          <td style="text-align:center;color:#90a4ae">${realScore}</td>
          <td style="text-align:center;color:${ptsColor};font-weight:700">${pts > 0 ? '+'+pts : pts}</td>
        </tr>`;
      });
      html += `</tbody></table></div></div>`;
    }
    html += `</div>`;
    return html;
  }

  // Per-matchday sections
  if (!md.length) {
    html += `<div class="alert alert-info">Sin datos aún. Los puntajes aparecen cuando el admin cargue resultados.</div>`;
  } else {
    md.forEach(cat => {
      const secKey = 'lb_' + cat.key;
      const isOpen = state.collapsedGroups[secKey] === true;
      html += `<div class="group-section">
        <h2 class="group-title" style="cursor:pointer" onclick="toggleLbSection('${esc(secKey)}')">
          ${cat.label} <span style="float:right;font-size:0.85rem;color:#78909c">${isOpen ? '▲' : '▼'}</span>
        </h2>`;
      if (isOpen) {
        if (!cat.users.length) {
          html += `<div style="padding:0.7rem;color:#78909c;font-size:0.85rem;text-align:center">Sin participantes en esta fecha</div>`;
        } else {
          cat.users.forEach((u, i) => {
            const lbKey = cat.key + '_' + u.id;
            const exp = state.expandedLbKey === lbKey;
            const medals = ['🥇'];
            html += `<div class="leaderboard-row" style="cursor:pointer" data-action="toggle-lb-user" data-lb-key="${esc(lbKey)}">
              <span class="lb-pos">${i < 1 ? medals[i] : '#' + (i+1)}</span>
              <span class="lb-name">${esc(u.username)}</span>
              <span class="lb-pts">${u.points} pts</span>
              <span style="color:#78909c;font-size:0.8rem">${exp ? '▲' : '▼'}</span>
            </div>`;
            if (exp) {
              const preds = state.allPredictions.filter(p => p.userId === u.id && cat.matchdays.includes(p.matchday));
              const sorted = preds.map(p => getMatchById(p.matchId)).filter(Boolean)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
              html += `<div style="padding:0.5rem;overflow-x:auto">`;
              if (!sorted.length) {
                html += `<div style="color:#78909c;font-size:0.8rem;text-align:center;padding:0.5rem">Sin pronósticos en esta fecha</div>`;
              } else {
                html += `<table>
                  <thead><tr style="color:#78909c">
                    <th>Partido</th><th>Pronóstico</th><th>Resultado</th><th>Pts</th>
                  </tr></thead><tbody>`;
                sorted.forEach(m => {
                  const p = preds.find(x => x.matchId === m.id);
                  const realScore = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : '-';
                  const predScore = p ? `${p.homeScore} - ${p.awayScore}` : '-';
                  const pts = p?.points || 0;
                  const ptsColor = pts >= 3 ? '#4caf50' : pts >= 1 ? '#ffd54f' : '#78909c';
                  html += `<tr>
                    <td>${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</td>
                    <td style="text-align:center;color:#4fc3f7">${predScore}</td>
                    <td style="text-align:center;color:#90a4ae">${realScore}</td>
                    <td style="text-align:center;color:${ptsColor};font-weight:700">${pts > 0 ? '+'+pts : pts}</td>
                  </tr>`;
                });
                html += `</tbody></table>`;
              }
              html += `</div>`;
            }
          });
        }
      }
      html += `</div>`;
    });
  }
  html += `</div>`;
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

function buildAdminResultados() {
  let html = `<div class="container"><h1>📋 Cargar Resultados</h1>`;
  const ms = state.matches;
  if (!ms.length) {
    html += `<div class="alert alert-info">Cargando partidos...</div>`;
  } else {
    const groups = { pendientes: [], jugados: [] };
    ms.forEach(m => {
      if (m.homeScore != null) groups.jugados.push(m);
      else groups.pendientes.push(m);
    });

    if (groups.pendientes.length) {
      html += `<h2>Pendientes (${groups.pendientes.length})</h2>`;
      groups.pendientes.forEach(m => {
        const s = state.adminScores[m.id] || { home: '', away: '' };
        html += `<div class="match-card">
          <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)} ${m.featured ? '<span class="featured-badge">🔥</span>' : ''}</div>
          <div class="match-inputs">
            <input type="number" min="0" max="20" data-action="admin-score-home" data-match-id="${esc(m.id)}" value="${s.home}" placeholder="0" style="width:54px;padding:0.45rem 0.5rem;font-size:1rem">
            <span style="color:#546e7a;font-size:1rem">-</span>
            <input type="number" min="0" max="20" data-action="admin-score-away" data-match-id="${esc(m.id)}" value="${s.away}" placeholder="0" style="width:54px;padding:0.45rem 0.5rem;font-size:1rem">
            <button class="btn btn-primary btn-sm" data-action="save-result" data-match-id="${esc(m.id)}">Guardar</button>
          </div>
        </div>`;
      });
    }

    if (groups.jugados.length) {
      html += `<h2 style="margin-top:1rem">Jugados</h2>`;
      groups.jugados.forEach(m => {
        html += `<div class="match-card">
          <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</div>
          <div class="match-score">${m.homeScore} - ${m.awayScore}</div>
          <button class="btn btn-danger btn-sm" data-action="clear-result" data-match-id="${esc(m.id)}">🗑️ Limpiar</button>
        </div>`;
      });
    }
  }
  html += `<div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #1e3a4a">
    <button class="btn btn-danger btn-sm" data-action="clean-orphans">🧹 Limpiar predicciones huérfanas</button>
    <span style="color:#78909c;font-size:0.75rem;margin-left:0.5rem">Elimina pronósticos de usuarios eliminados</span>
    <button class="btn btn-danger btn-sm" data-action="clean-all-preds" style="margin-left:0.5rem">🗑️ Limpiar TODAS las predicciones</button>
    <span style="color:#ef5350;font-size:0.75rem;margin-left:0.5rem">Elimina todo, todos los usuarios vuelven a empezar</span>
  </div>`;
  html += `</div>`;
  return html;
}




