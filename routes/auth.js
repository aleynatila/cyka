const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// GET routes
router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('index', {
        user: req.user
    });
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/forget-password', (req, res) => {
    res.render('forget');
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('profile', {
            user: req.user
        });
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/dashboard', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('dashboard', {
            user: req.user
        });
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/payment', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('payment', {
            user: req.user
        });
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 2 * 1000), // Çerez 2 saniye sonra sona erecek
        httpOnly: true,
    });

    res.redirect('/auth/login'); // Çıkıştan sonra giriş sayfasına yönlendirin
});

// POST routes
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
