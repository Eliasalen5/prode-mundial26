const FLAG_CODES = {
  'Argentina': 'ar', 'Brasil': 'br', 'Uruguay': 'uy', 'Colombia': 'co',
  'Chile': 'cl', 'Ecuador': 'ec', 'Perú': 'pe', 'Paraguay': 'py',
  'Venezuela': 've', 'Bolivia': 'bo', 'Inglaterra': 'gb-eng',
  'España': 'es', 'Alemania': 'de', 'Italia': 'it', 'Francia': 'fr',
  'Países Bajos': 'nl', 'Portugal': 'pt', 'Bélgica': 'be',
  'Croacia': 'hr', 'Suiza': 'ch', 'Dinamarca': 'dk', 'Suecia': 'se',
  'Noruega': 'no', 'Polonia': 'pl', 'Austria': 'at', 'Ucrania': 'ua',
  'Serbia': 'rs', 'Turquía': 'tr', 'República Checa': 'cz',
  'Escocia': 'gb-sct', 'Gales': 'gb-wls', 'Hungría': 'hu',
  'Rumanía': 'ro', 'Grecia': 'gr', 'Eslovaquia': 'sk',
  'Eslovenia': 'si', 'Irlanda': 'ie', 'Islandia': 'is',
  'Marruecos': 'ma', 'Senegal': 'sn', 'Nigeria': 'ng',
  'Costa de Marfil': 'ci', 'Ghana': 'gh', 'Egipto': 'eg',
  'Camerún': 'cm', 'Argelia': 'dz', 'Túnez': 'tn',
  'Mali': 'ml', 'Burkina Faso': 'bf', 'Sudáfrica': 'za',
  'RD Congo': 'cd', 'Cabo Verde': 'cv',
  'Japón': 'jp', 'Corea del Sur': 'kr', 'Australia': 'au',
  'Arabia Saudita': 'sa', 'Irán': 'ir', 'Qatar': 'qa',
  'Catar': 'qa', 'Irak': 'iq', 'Emiratos Árabes': 'ae', 'Uzbekistán': 'uz',
  'Jordania': 'jo', 'Omán': 'om', 'Baréin': 'bh',
  'Bosnia y Herzegovina': 'ba', 'Haití': 'ht', 'Curazao': 'cw',
  'Estados Unidos': 'us', 'México': 'mx', 'Canadá': 'ca',
  'Costa Rica': 'cr', 'Panamá': 'pa', 'Jamaica': 'jm',
  'Honduras': 'hn', 'El Salvador': 'sv',
  'Nueva Zelanda': 'nz', 'Tahití': 'pf',
};

function teamHTML(name) {
  const code = FLAG_CODES[name];
  if (!code) return esc(name);
  return `<img src="https://flagcdn.com/24x18/${code}.png" alt="${esc(name)}" style="vertical-align:middle;margin-right:4px;border-radius:2px"> ${esc(name)}`;
}
