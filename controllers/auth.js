const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const cookieParser = require('cookie-parser');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 2 * 1000), // 2 saniye sonra çerez silinecek
        httpOnly: true,
    });

    res.redirect('/login'); // Çıkış yaptıktan sonra login sayfasına yönlendirme
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide an email and password'
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Server error');
            }

            if (!results || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                });
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                };

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/auth/dashboard");
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

exports.register = async (req, res) => {
    console.log(req.body);

    const { name, email, password, confirm_password } = req.body;

    try {
        const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
        db.query(checkEmailQuery, [email], async (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Server error');
            }

            if (results.length > 0) {
                return res.render('register', {
                    message: 'That email is already in use'
                });
            } else if (password !== confirm_password) {
                return res.render('register', {
                    message: 'Passwords do not match'
                });
            }

            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword);

            const insertUserQuery = 'INSERT INTO users SET ?';
            db.query(insertUserQuery, { name: name, email: email, password: hashedPassword }, (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send('Server error');
                }
                console.log(results);

                res.render('register', {
                    message: 'User registered please login'
                });
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            console.log(decoded);

            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                if (error) {
                    console.log(error);
                    return next();
                }

                if (!result || result.length === 0) {
                    return next();
                }

                req.user = result[0];
                console.log("User found:");
                console.log(req.user);
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }
};
