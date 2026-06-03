const state = {
  user: null,
  userData: null,
  loading: true,
  matches: [],
  error: '',
  collapsedGroups: { fecha_1: false, fecha_2: false, fecha_3: false, fecha_elim: false },
  adminScores: {},
};

let unsubScores = null;
let currentPage = '';

function cleanupListeners() {
  if (unsubScores) { unsubScores(); unsubScores = null; }
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


