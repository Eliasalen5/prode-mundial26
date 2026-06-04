const state = {
  user: null,
  userData: null,
  loading: true,
  matches: [],
  error: '',
  collapsedGroups: { fecha_1: false, fecha_2: false, fecha_3: false, fecha_elim: false },
  adminScores: {},
  fechaPaid: { '1': false, '2': false, '3': false, 'elim': false },
  fechaPrice: 15000,
  fechaStatus: {},
  usersMap: {},
  selectedPagosUser: '',
  notifications: [],
  lastNotifCount: 0,
  predictions: {},
  homeScores: {},
  allPredictions: {},
  selectedPosicionesFilter: '',
  posicionesSelectedUid: '',
  posicionesDetail: [],
  posicionesDetailLoading: false,
};

let unsubScores = null;
let unsubPagos = null;
let unsubNotifications = null;
let unsubPredictions = null;
let unsubAllPredictions = null;
let currentPage = '';

function cleanupListeners() {
  if (unsubScores) { unsubScores(); unsubScores = null; }
  if (unsubPagos) { unsubPagos(); unsubPagos = null; }
  if (unsubNotifications) { unsubNotifications(); unsubNotifications = null; }
  if (unsubPredictions) { unsubPredictions(); unsubPredictions = null; }
  if (unsubAllPredictions) { unsubAllPredictions(); unsubAllPredictions = null; }
}

function getPage() {
  return window.location.hash.slice(1) || '/';
}

function navigate(path) {
  window.location.hash = path;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
