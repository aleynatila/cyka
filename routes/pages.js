const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Ana sayfa route'u
router.get('/', authController.isLoggedIn, (req, res) => {
  res.render('index', {
    user: req.user
  });
});

// Kayıt sayfası route'u
router.get('/register', (req, res) => {
  res.render('register');
});

// Giriş sayfası route'u
router.get('/login', (req, res) => {
  res.render('login');
});

// Şifre unutma sayfası route'u
router.get('/forget-password', (req, res) => {
  res.render('forget'); // Render your forget.hbs view
});

// Profil sayfası route'u
router.get('/profile', authController.isLoggedIn, (req, res) => {
  console.log(req.user);
  if (req.user) {
    res.render('profile', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
});

// Dashboard sayfası route'u
router.get('/dashboard', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.render('dashboard', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
});

// Ödeme sayfası route'u
router.get('/payment', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.render('payment', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
