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
      <a href="#/posiciones" class="${getPage() === '/posiciones' ? 'active' : ''}">🏆 Posiciones</a>
      <a href="#/pronosticos" class="${getPage() === '/pronosticos' ? 'active' : ''}">📝 Pronósticos</a>
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

function getFechaPrize(key) {
  const count = Object.values(state.fechaStatus).filter(fs => fs?.[key]).length;
  return count * state.fechaPrice * 0.9;
}

function buildHome() {
  let html = `<div class="container">
    <h1>Fixture Mundial 2026</h1>
    <div class="banner-premios">
      <div><strong>📊 Sistema de puntos:</strong></div>
      <div style="margin-top:0.2rem"><span class="pts">▸ Partido normal → resultado exacto <strong>3 pts</strong>, ganador o empate <strong>1 pt</strong></span></div>
      <div style="margin-top:0.1rem"><span style="color:#29b6f6">▸ Partido destacado 🔥 → resultado exacto <strong>5 pts</strong>, ganador o empate <strong>2 pts</strong></span></div>
      <div style="margin-top:0.2rem;font-size:0.78rem;color:#78909c">⏱ Las predicciones pueden modificarse hasta <strong>10 minutos antes</strong> de cada partido. Después se bloquean automáticamente.</div>
      <div style="margin-top:0.5rem"><strong>🏆 Premios por fecha:</strong></div>
      <div class="premios-grid">
        <span class="premio-item">Fecha 1: <strong>$${Math.round(getFechaPrize('1')).toLocaleString()}</strong></span>
        <span class="premio-item">Fecha 2: <strong>$${Math.round(getFechaPrize('2')).toLocaleString()}</strong></span>
        <span class="premio-item">Fecha 3: <strong>$${Math.round(getFechaPrize('3')).toLocaleString()}</strong></span>
        <span class="premio-item">Eliminatorias: <strong>$${Math.round(getFechaPrize('elim')).toLocaleString()}</strong></span>
      </div>
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
      const isPaid = state.fechaPaid[f];
      html += `<div class="group-section">
        <h2 class="group-title" style="cursor:pointer" data-action="toggle-group" data-key="${esc(key)}">
          📅 Fecha ${f} <span style="float:right;font-size:0.85rem;color:#78909c">${isOpen ? '▲' : '▼'}</span>
        </h2>`;
      if (state.user && !isPaid) {
        html += `<div class="pay-banner">
          <span style="color:#ffd54f">🔒 Pagá $${state.fechaPrice.toLocaleString()} para Fecha ${f}</span>
          <button class="btn btn-success btn-sm" style="margin-left:0.5rem" data-action="pay-fecha" data-fecha="${f}">💵 Pagar por WhatsApp</button>
          <div style="margin-top:0.3rem;font-size:0.75rem;color:#78909c">Alias: <strong style="cursor:pointer;color:#4fc3f7" onclick="navigator.clipboard.writeText('Eliasalen5')">Eliasalen5</strong> (tocá para copiar)</div>
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
        <div style="margin-top:0.3rem;font-size:0.75rem;color:#78909c">Alias: <strong style="cursor:pointer;color:#4fc3f7" onclick="navigator.clipboard.writeText('Eliasalen5')">Eliasalen5</strong> (tocá para copiar)</div>
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
  const pred = state.predictions[m.id];
  const now = new Date();
  const matchDate = m.matchDate?.toDate ? m.matchDate.toDate() : new Date(m.date);
  const isTimeLocked = (matchDate.getTime() - now.getTime()) < 10 * 60 * 1000;

  let html = `<div class="match-card${m.featured ? ' featured' : ''}${(isLocked || (isTimeLocked && !hasResult)) ? ' locked' : ''}">`;
  html += `<div class="match-teams">
    ${teamHTML(m.homeTeam)}
    <span class="vs">vs</span>
    ${teamHTML(m.awayTeam)}
    ${m.featured ? '<span class="featured-badge">🔥 Destacado</span>' : ''}
  </div>`;
  html += `<div class="match-info">${formatDate(matchDate)}</div>`;

  if (hasResult) {
    html += `<div class="match-score">${m.homeScore} - ${m.awayScore}</div>`;
    if (pred && pred.points != null) {
      const ptsColor = pred.points >= 3 ? '#4caf50' : pred.points >= 1 ? '#ffd54f' : '#78909c';
      html += `<div style="font-size:0.8rem;color:${ptsColor};font-weight:700">+${pred.points} pts</div>`;
    }
  } else if (isLocked) {
    html += `<span class="locked-badge">🔒</span>`;
  } else if (state.user && !hasResult) {
    if (isTimeLocked) {
      if (pred) {
        html += `<div class="match-pred">${pred.homeScore} - ${pred.awayScore} <span class="locked-badge">🔒</span></div>`;
      } else {
        html += `<div style="text-align:center;padding:0.5rem;color:#546e7a;font-size:0.8rem">🔒 Sin pronóstico</div>`;
      }
    } else {
      const hs = state.homeScores[m.id] || (pred ? { home: pred.homeScore, away: pred.awayScore } : { home: '', away: '' });
      html += `<div class="match-inputs">
        <input type="number" min="0" max="20" data-action="home-score" data-match-id="${esc(m.id)}" value="${hs.home}" placeholder="0">
        <span style="color:#546e7a">-</span>
        <input type="number" min="0" max="20" data-action="away-score" data-match-id="${esc(m.id)}" value="${hs.away}" placeholder="0">
        <button class="btn btn-primary btn-sm" data-action="save-prediction" data-match-id="${esc(m.id)}">${pred ? 'Modificar' : 'Guardar'}</button>
      </div>`;
    }
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

function buildPronosticos() {
  let html = `<div class="container">
    <h1>Mis Pronósticos</h1>`;

  const preds = Object.values(state.predictions);
  if (!preds.length) {
    html += `<div class="alert alert-info">Todavía no cargaste ningún pronóstico. Andá al <a href="#/">Fixture</a> para empezar.</div>`;
    html += `</div>`;
    return html;
  }

  const matchdays = {};
  preds.forEach(p => {
    const m = state.matches.find(x => x.id === p.matchId);
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
  let html = `<div class="container">
    <h1>🏆 Posiciones</h1>`;

  const filter = state.selectedPosicionesFilter || '1';

  const mdLabels = { '1': 'Fecha 1', '2': 'Fecha 2', '3': 'Fecha 3', 'elim': 'Eliminatorias' };
  html += `<select class="filter-select" data-action="filter-posiciones">`;
  Object.keys(mdLabels).forEach(k => {
    html += `<option value="${esc(k)}" ${filter === k ? 'selected' : ''}>${mdLabels[k]}</option>`;
  });
  html += `</select>`;

  // Prize for this fecha
  const prize = Math.round(getFechaPrize(filter));
  html += `<div style="margin:0.5rem 0 1rem;padding:0.6rem;background:#1a2a3e;border-radius:6px;text-align:center;font-size:0.9rem;color:#ffd54f">
    🥇 1er puesto: <strong>$${prize.toLocaleString()}</strong>
  </div>`;

  // Match IDs for the selected fecha
  const matchIdsInFecha = new Set();
  state.matches.forEach(m => {
    const md = m.stage === 'knockout' ? 'elim' : String(m.matchday);
    if (filter === md) matchIdsInFecha.add(m.id);
  });

  // Users who paid for the selected fecha
  const paidUsers = state.fechaStatus && Object.keys(state.fechaStatus).length
    ? Object.keys(state.fechaStatus).filter(uid => state.fechaStatus[uid]?.[filter])
    : [];

  // Points from scored predictions only in this fecha
  const userPoints = {};
  Object.values(state.allPredictions).forEach(p => {
    if (!matchIdsInFecha.has(p.matchId)) return;
    if (!userPoints[p.userId]) userPoints[p.userId] = { total: 0, predicted: 0, exactos: 0, parciales: 0 };
    userPoints[p.userId].total += p.points || 0;
    userPoints[p.userId].predicted++;
    if (p.points >= 3) userPoints[p.userId].exactos++;
    else if (p.points >= 1) userPoints[p.userId].parciales++;
  });

  // Merge paying users + scored users
  const allUids = new Set([...paidUsers, ...Object.keys(userPoints)]);
  const sorted = Array.from(allUids)
    .map(uid => ({
      uid,
      ...(userPoints[uid] || { total: 0, predicted: 0, exactos: 0, parciales: 0 }),
      username: state.usersMap[uid] || uid.slice(0, 8),
    }))
    .sort((a, b) => b.total - a.total);

  if (!sorted.length) {
    html += `<div class="alert alert-info">Aún no hay participantes. Cuando los usuarios paguen, aparecerán acá.</div>`;
    html += `</div>`;
    return html;
  }

  html += `<div class="standings-scroll"><table class="standings-table">
    <thead><tr>
      <th>#</th><th>Usuario</th><th>Pts</th><th>Pronosticados</th><th>Exactos</th><th>Parciales</th>
    </tr></thead><tbody>`;
  sorted.forEach((u, i) => {
    const highlight = state.user?.uid === u.uid ? ' style="background:#1a3a5c;font-weight:700"' : '';
    html += `<tr${highlight}>
      <td style="cursor:pointer" data-action="show-user-predictions" data-uid="${esc(u.uid)}">${i === 0 ? '🥇' : (i + 1)}</td>
      <td style="cursor:pointer" data-action="show-user-predictions" data-uid="${esc(u.uid)}">${esc(u.username)}</td>
      <td class="pts-cell">${u.total}</td>
      <td>${u.predicted}</td>
      <td>${u.exactos}</td>
      <td>${u.parciales}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;

  // Detail section for selected user
  if (state.posicionesSelectedUid) {
    const uid = state.posicionesSelectedUid;
    const username = state.usersMap[uid] || uid.slice(0, 8);
    html += `<div class="group-section" style="margin-top:1.5rem">
      <h2 class="group-title" style="cursor:default">📝 Pronósticos de ${esc(username)}
        <button class="btn btn-sm" style="float:right;background:#37474f;color:#e0e0e0;border:none;padding:0.3rem 0.7rem;border-radius:4px;cursor:pointer" data-action="close-user-detail">✕ Cerrar</button>
      </h2>`;
    if (state.posicionesDetailLoading) {
      html += `<div style="text-align:center;padding:1rem;color:#90a4ae">Cargando pronósticos...</div>`;
    } else if (!state.posicionesDetail.length) {
      html += `<div style="padding:0.8rem;color:#546e7a">Este usuario no cargó pronósticos para esta fecha.</div>`;
    } else {
      state.posicionesDetail.forEach(p => {
        const m = p.match;
        if (!m) return;
        const realScore = m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : '—';
        const predTxt = p.homeScore != null ? `${p.homeScore} - ${p.awayScore}` : '—';
        const ptsTxt = p.points != null ? `${p.points} pts` : '—';
        const ptsColor = p.points >= 3 ? '#4caf50' : p.points >= 1 ? '#ffd54f' : '#78909c';
        html += `<div class="match-card">
          <div class="match-teams">${teamHTML(m.homeTeam)} vs ${teamHTML(m.awayTeam)}</div>
          <div style="display:flex;gap:1rem;justify-content:center;align-items:center;flex-wrap:wrap">
            <span style="color:#90a4ae;font-size:0.85rem">Pronóstico: <strong>${predTxt}</strong></span>
            <span style="color:#90a4ae;font-size:0.85rem">Resultado: <strong>${realScore}</strong></span>
            <span style="color:${ptsColor};font-size:0.9rem;font-weight:700">${ptsTxt}</span>
          </div>
        </div>`;
      });
    }
    html += `</div>`;
  }

  html += `<div class="alert alert-info" style="margin-top:0.8rem;font-size:0.8rem">ℹ️ En caso de empate en puntos, gana quien tenga más resultados exactos.</div>`;

  html += `</div>`;
  return html;
}
  let html = `<div class="container"><h1>💵 Pagos Pendientes</h1>`;

  const userFecha = {};
  Object.keys(state.usersMap).forEach(uid => {
    const fs = state.fechaStatus[uid] || {};
    ['1', '2', '3', 'elim'].forEach(fk => {
      if (!fs[fk]) {
        if (!userFecha[uid]) userFecha[uid] = {};
        userFecha[uid][fk] = 0;
      }
    });
  });

  const uids = Object.keys(userFecha).filter(uid => {
    return !state.selectedPagosUser || uid === state.selectedPagosUser;
  });

  if (Object.keys(userFecha).length) {
    html += `<select class="filter-select" data-action="filter-pagos">
      <option value="">Todos los participantes</option>`;
    Object.keys(userFecha).forEach(uid => {
      html += `<option value="${esc(uid)}" ${state.selectedPagosUser === uid ? 'selected' : ''}>${esc(state.usersMap[uid] || uid.slice(0,8))}</option>`;
    });
    html += `</select>`;
  }

  if (!uids.length) {
    html += `<div class="alert alert-info">Sin pagos pendientes</div>`;
  } else {
    uids.forEach(uid => {
      const fechas = Object.keys(userFecha[uid]);
      html += `<div class="group-section">
        <h2 class="group-title">${esc(state.usersMap[uid] || uid.slice(0,8))}</h2>`;
      fechas.forEach(fk => {
        const label = fk === 'elim' ? 'Eliminatorias' : 'Fecha ' + fk;
        html += `<div class="match-card" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
          <span><strong>${label}</strong> — $${state.fechaPrice.toLocaleString()}</span>
          <button class="btn btn-success btn-sm" data-action="confirm-fecha-pay" data-uid="${esc(uid)}" data-fecha="${esc(fk)}">✅ Confirmar pago</button>
        </div>`;
      });
      html += `</div>`;
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
      <input type="number" min="0" max="20" data-action="admin-score-home" data-match-id="${esc(m.id)}" value="${s.home}" placeholder="0">
      <span style="color:#546e7a;font-size:1rem">-</span>
      <input type="number" min="0" max="20" data-action="admin-score-away" data-match-id="${esc(m.id)}" value="${s.away}" placeholder="0">
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
