auth.onAuthStateChanged(async (user) => {
  state.user = user;
  try {
    if (user) {
      const snap = await db.collection('users').doc(user.uid).get();
      state.userData = snap.exists ? snap.data() : null;
      state.eliminatoriasPaid = snap.exists ? (snap.data().eliminatoriasPaid || false) : false;
    } else {
      state.userData = null;
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    state.userData = null;
  }
  state.loading = false;
  render();
});

function handleLogin(email, password) {
  state.error = '';
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      state.error = (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')
        ? 'Email o contraseña incorrectos' : err.message;
      render();
    });
}

function handleRegister(nombre, apellido, email, password, phone) {
  state.error = '';
  const username = (nombre + ' ' + apellido).trim();
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection('users').doc(cred.user.uid).set({
        nombre, apellido, username, email, phone, role: 'user', createdAt: new Date()
      });
    })
    .then(() => {
      return db.collection('users').where('role', '==', 'admin').get();
    })
    .then(snap => {
      const promises = [];
      snap.docs.forEach(adminDoc => {
        promises.push(db.collection('notifications').add({
          userId: adminDoc.id,
          message: `Nuevo usuario registrado: ${username}`,
          read: false,
          createdAt: new Date(),
        }));
      });
      return Promise.all(promises);
    })
    .catch(err => {
      state.error = err.code === 'auth/email-already-in-use' ? 'El email ya está registrado' : err.message;
      render();
    });
}

function handleLogout() {
  auth.signOut().then(() => navigate('/login')).catch(() => {});
}
