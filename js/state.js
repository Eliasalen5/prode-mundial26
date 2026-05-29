const state = {
  user: null,
  userData: null,
  loading: true,
  matches: [],
  predictions: {},
  homeScores: {},
  adminScores: {},
  allPredictions: [],
  expandedUser: null,
  leaderboardMD: [],
  expandedLbKey: '',
  collapsedGroups: { fecha_1: false, fecha_2: false, fecha_3: false, fecha_elim: false },
  pendingPagos: [],
  paidHistory: [],
  usersMap: {},
  notifications: [],
  lastNotifCount: 0,
  selectedHistorialUser: '',
  selectedPagosUser: '',
  selectedLeaderboardUser: '',
  selectedPronosticosFilter: '',
  prizeData: {},
  error: '',
};

let unsubScores = null;
let unsubPagos = null;
let unsubNotifications = null;
let unsubPredictions = null;
let unsubLeaderboard = null;
let currentPage = '';

function cleanupListeners() {
  if (unsubPagos) { unsubPagos(); unsubPagos = null; }
  if (unsubNotifications) { unsubNotifications(); unsubNotifications = null; }
  if (unsubPredictions) { unsubPredictions(); unsubPredictions = null; }
  if (unsubLeaderboard) { unsubLeaderboard(); unsubLeaderboard = null; }
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

function getMatchById(id) {
  return state.matches.find(m => m.id === id);
}
