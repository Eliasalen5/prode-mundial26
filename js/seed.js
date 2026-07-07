function isFeatured(i) {
  // F1: BRA-MAR(6) ARG-ALG(19) ENG-CRO(22) | F2: MEX-KOR(28) BRA-HAI(31) NED-SWE(33) ARG-AUT(41) | F3: GER-ECU(56) ESP-URU(64) POR-COL(69) ARG-JOR(72)
  return [6, 19, 22, 28, 31, 33, 41, 56, 64, 69, 72, 104].includes(i);
}

function getSeedData() {
  const data = [];

  function add(d, t, home, away, group, md, month) {
    const m = month || '06';
    const dateStr = '2026-' + m + '-' + String(d).padStart(2,'0') + 'T' + t + ':00-03:00';
    const i = data.length + 1;
    data.push({ id:'match_'+i, group, matchday:md, homeTeam:home, awayTeam:away, date:dateStr, featured:isFeatured(i), stage:'group' });
  }

  function addKO(m, d, t, home, away) {
    const dateStr = '2026-' + d + 'T' + t + ':00-03:00';
    const i = data.length + 1;
    data.push({ id:'match_'+i, group:'', matchday:m, homeTeam:home, awayTeam:away, date:dateStr, featured:isFeatured(i), stage:'knockout' });
  }

  // ── FECHA 1 (24 partidos: 11–17 Jun) ──────────────────────────────
  add(11,'16:00','México','Sudáfrica','A',1);
  add(11,'23:00','Corea del Sur','República Checa','A',1);
  add(12,'16:00','Canadá','Bosnia y Herzegovina','B',1);
  add(12,'22:00','Estados Unidos','Paraguay','D',1);
  add(13,'16:00','Catar','Suiza','B',1);
  add(13,'19:00','Brasil','Marruecos','C',1);
  add(13,'22:00','Haití','Escocia','C',1);
  add(14,'01:00','Australia','Turquía','D',1);
  add(14,'14:00','Alemania','Curazao','E',1);
  add(14,'17:00','Países Bajos','Japón','F',1);
  add(14,'20:00','Costa de Marfil','Ecuador','E',1);
  add(14,'23:00','Suecia','Túnez','F',1);
  add(15,'13:00','España','Cabo Verde','H',1);
  add(15,'16:00','Bélgica','Egipto','G',1);
  add(15,'19:00','Arabia Saudita','Uruguay','H',1);
  add(15,'22:00','Irán','Nueva Zelanda','G',1);
  add(16,'16:00','Francia','Senegal','I',1);
  add(16,'19:00','Irak','Noruega','I',1);
  add(16,'22:00','Argentina','Argelia','J',1);
  add(17,'01:00','Austria','Jordania','J',1);
  add(17,'14:00','Portugal','RD Congo','K',1);
  add(17,'17:00','Inglaterra','Croacia','L',1);
  add(17,'20:00','Ghana','Panamá','L',1);
  add(17,'23:00','Uzbekistán','Colombia','K',1);

  // ── FECHA 2 (24 partidos: 18–23 Jun) ──────────────────────────────
  add(18,'13:00','República Checa','Sudáfrica','A',2);
  add(18,'16:00','Suiza','Bosnia y Herzegovina','B',2);
  add(18,'19:00','Canadá','Catar','B',2);
  add(18,'22:00','México','Corea del Sur','A',2);
  add(19,'16:00','Estados Unidos','Australia','D',2);
  add(19,'19:00','Escocia','Marruecos','C',2);
  add(19,'22:00','Brasil','Haití','C',2);
  add(20,'01:00','Turquía','Paraguay','D',2);
  add(20,'14:00','Suecia','Países Bajos','F',2);
  add(20,'17:00','Alemania','Costa de Marfil','E',2);
  add(20,'21:00','Ecuador','Curazao','E',2);
  add(21,'01:00','Túnez','Japón','F',2);
  add(21,'13:00','España','Arabia Saudita','H',2);
  add(21,'16:00','Bélgica','Irán','G',2);
  add(21,'19:00','Uruguay','Cabo Verde','H',2);
  add(21,'22:00','Nueva Zelanda','Egipto','G',2);
  add(22,'14:00','Argentina','Austria','J',2);
  add(22,'18:00','Francia','Irak','I',2);
  add(22,'21:00','Noruega','Senegal','I',2);
  add(23,'00:00','Jordania','Argelia','J',2);
  add(23,'14:00','Portugal','Uzbekistán','K',2);
  add(23,'17:00','Inglaterra','Ghana','L',2);
  add(23,'20:00','Panamá','Croacia','L',2);
  add(23,'23:00','Colombia','RD Congo','K',2);

  // ── FECHA 3 (24 partidos: 24–27 Jun) ──────────────────────────────
  add(24,'16:00','Suiza','Canadá','B',3);
  add(24,'16:00','Bosnia y Herzegovina','Catar','B',3);
  add(24,'19:00','Escocia','Brasil','C',3);
  add(24,'19:00','Marruecos','Haití','C',3);
  add(24,'22:00','República Checa','México','A',3);
  add(24,'22:00','Sudáfrica','Corea del Sur','A',3);
  add(25,'17:00','Curazao','Costa de Marfil','E',3);
  add(25,'17:00','Ecuador','Alemania','E',3);
  add(25,'20:00','Japón','Suecia','F',3);
  add(25,'20:00','Túnez','Países Bajos','F',3);
  add(25,'23:00','Turquía','Estados Unidos','D',3);
  add(25,'23:00','Paraguay','Australia','D',3);
  add(26,'16:00','Noruega','Francia','I',3);
  add(26,'16:00','Senegal','Irak','I',3);
  add(26,'21:00','Cabo Verde','Arabia Saudita','H',3);
  add(26,'21:00','Uruguay','España','H',3);
  add(27,'00:00','Egipto','Irán','G',3);
  add(27,'00:00','Nueva Zelanda','Bélgica','G',3);
  add(27,'18:00','Panamá','Inglaterra','L',3);
  add(27,'18:00','Croacia','Ghana','L',3);
  add(27,'20:30','Colombia','Portugal','K',3);
  add(27,'20:30','RD Congo','Uzbekistán','K',3);
  add(27,'23:00','Argelia','Austria','J',3);
  add(27,'23:00','Jordania','Argentina','J',3);

  // ── ELIMINATORIAS (32 partidos) ────────────────────────────────────
  // 16avos — Jun 28–Jul 3
  addKO('16avos','06-28','16:00','2° Grupo A','2° Grupo B');
  addKO('16avos','06-29','14:00','1° Grupo C','2° Grupo F');
  addKO('16avos','06-29','17:30','Alemania','3° (A/B/C/D/F)');
  addKO('16avos','06-29','22:00','1° Grupo F','2° Grupo C');
  addKO('16avos','06-30','14:00','2° Grupo E','2° Grupo I');
  addKO('16avos','06-30','18:00','1° Grupo I','3° (C/D/F/G/H)');
  addKO('16avos','06-30','22:00','México','3° (C/E/F/H/I)');
  addKO('16avos','07-01','13:00','1° Grupo L','3° (E/H/I/J/K)');
  addKO('16avos','07-01','17:00','1° Grupo G','3° (A/E/H/I/J)');
  addKO('16avos','07-01','21:00','Estados Unidos','3° (B/E/F/I/J)');
  addKO('16avos','07-02','16:00','1° Grupo H','2° Grupo J');
  addKO('16avos','07-02','20:00','2° Grupo K','2° Grupo L');
  addKO('16avos','07-03','00:00','1° Grupo B','3° (E/F/G/I/J)');
  addKO('16avos','07-03','15:00','2° Grupo D','2° Grupo G');
  addKO('16avos','07-03','19:00','Argentina','2° Grupo H');
  addKO('16avos','07-03','22:30','1° Grupo K','3° (D/E/I/J/L)');

  // 8avos — Jul 4–7
  addKO('8avos','07-04','14:00','Ganador 51','Ganador 52');
  addKO('8avos','07-04','18:00','Ganador 49','Ganador 50');
  addKO('8avos','07-05','17:00','Ganador 57','Ganador 58');
  addKO('8avos','07-05','21:00','Ganador 59','Ganador 60');
  addKO('8avos','07-06','16:00','Ganador 53','Ganador 54');
  addKO('8avos','07-06','21:00','Ganador 55','Ganador 56');
  addKO('8avos','07-07','13:00','Ganador 61','Ganador 62');
  addKO('8avos','07-07','17:00','Ganador 63','Ganador 64');

  // Cuartos — Jul 9–11
  addKO('Cuartos','07-09','17:00','Ganador 69','Ganador 70');
  addKO('Cuartos','07-10','16:00','Ganador 65','Ganador 66');
  addKO('Cuartos','07-11','18:00','Ganador 67','Ganador 68');
  addKO('Cuartos','07-11','22:00','Ganador 71','Ganador 72');

  // Semis — Jul 14–15
  addKO('Semis','07-14','16:00','Ganador 73','Ganador 74');
  addKO('Semis','07-15','16:00','Ganador 75','Ganador 76');

  // 3er puesto — Jul 18
  addKO('3er puesto','07-18','18:00','Perdedor 77','Perdedor 78');

  // Final — Jul 19
  addKO('Final','07-19','16:00','Ganador 77','Ganador 78');

  return data;
}
