function isFeatured(i) {
  const featured = [1, 2, 12, 25, 30, 31, 49, 50, 60];
  return featured.includes(i);
}

function getSeedData() {
  const data = [];
  const groups = [
    { name: 'A', teams: ['Argentina', 'Marruecos', 'Japón', 'Canadá'] },
    { name: 'B', teams: ['Brasil', 'Argelia', 'Corea del Sur', 'Túnez'] },
    { name: 'C', teams: ['España', 'Uruguay', 'Australia', 'Costa Rica'] },
    { name: 'D', teams: ['Alemania', 'Ecuador', 'Senegal', 'Panamá'] },
    { name: 'E', teams: ['Francia', 'Países Bajos', 'Nigeria', 'Jamaica'] },
    { name: 'F', teams: ['Portugal', 'Colombia', 'Ghana', 'Emiratos Árabes'] },
    { name: 'G', teams: ['Italia', 'Suecia', 'Egipto', 'Baréin'] },
    { name: 'H', teams: ['Bélgica', 'México', 'Camerún', 'Irak'] },
    { name: 'I', teams: ['Inglaterra', 'Suiza', 'Irán', 'Omán'] },
    { name: 'J', teams: ['Croacia', 'Dinamarca', 'Perú', 'Eslovaquia'] },
    { name: 'K', teams: ['Austria', 'Ucrania', 'Arabia Saudita', 'Qatar'] },
    { name: 'L', teams: ['Jordania', 'Chile', 'Paraguay', 'Venezuela'] },
  ];

  const baseDate = new Date('2026-06-11T13:00:00');
  let matchIndex = 0;

  groups.forEach((g, gi) => {
    const t = g.teams;
    const fixtures = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
    fixtures.forEach((pair, fi) => {
      matchIndex++;
      const date = new Date(baseDate);
      date.setDate(date.getDate() + gi * 2 + fi);
      date.setHours(13 + (matchIndex % 7));
      const featured = isFeatured(matchIndex);
      data.push({
        id: 'match_' + matchIndex,
        group: g.name,
        matchday: Math.floor((matchIndex - 1) / 24) + 1,
        homeTeam: t[pair[0]],
        awayTeam: t[pair[1]],
        date: date.toISOString(),
        featured: featured,
        price: featured ? 1000 : 500,
        stage: 'group',
      });
    });
  });

  const elimStages = [
    { key: 'R32', label: '32avos', count: 16 },
    { key: 'R16', label: 'Octavos', count: 8 },
    { key: 'QF', label: 'Cuartos', count: 4 },
    { key: 'SF', label: 'Semifinal', count: 2 },
    { key: '3rd', label: '3er Puesto', count: 1 },
    { key: 'Final', label: 'Final', count: 1 },
  ];

  elimStages.forEach(stage => {
    for (let i = 0; i < stage.count; i++) {
      matchIndex++;
      const date = new Date('2026-07-03T13:00:00');
      date.setDate(date.getDate() + Math.floor((matchIndex - 73) / 4));
      date.setHours(13 + (i % 4) * 3);
      data.push({
        id: 'match_' + matchIndex,
        group: '',
        matchday: stage.key,
        homeTeam: 'Clasificado ' + (i * 2 + 1),
        awayTeam: 'Clasificado ' + (i * 2 + 2),
        date: date.toISOString(),
        featured: false,
        price: 500,
        stage: 'knockout',
      });
    }
  });

  return data;
}
