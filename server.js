require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const pool = require("./db");


// CREATE EXPRESS APP
const app = express();

const PORT = process.env.PORT || 8080;
app.use(express.json());
// CORS
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));
// MYSQL SESSION STORE
const sessionStore = new MySQLStore({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME

});
// SESSION CONFIGURATION
app.use(session({

    name: "login.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: sessionStore,

    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    }

}));
// HOME API

app.get("/", (req, res) => {

    res.send("Node.js Login Backend is running!");

});
// REGISTER API
app.post("/api/auth/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;


        // Check empty fields
        if (!username || !email || !password) {

            return res.status(400).send(
                "All fields are required"
            );

        }


        // Check existing email
        const [existingUser] = await pool.query(

            "SELECT * FROM users WHERE email = ?",

            [email]

        );


        if (existingUser.length > 0) {

            return res.status(409).send(
                "Email already registered"
            );

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Insert user
        await pool.query(

            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",

            [
                username,
                email,
                hashedPassword
            ]

        );


        console.log(
            "User registered:",
            email
        );


        res.status(201).send(
            "Registration successful"
        );


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );

        res.status(500).send(
            "Server error"
        );

    }

});
// LOGIN API

app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        // Check fields
        if (!email || !password) {

            return res.status(400).send(
                "Email and password are required"
            );

        }


        // Find user
        const [users] = await pool.query(

            "SELECT * FROM users WHERE email = ?",

            [email]

        );


        // User not found
        if (users.length === 0) {

            return res.status(401).send(
                "Invalid email or password"
            );

        }


        const user = users[0];


        // Compare password
        const passwordMatch = await bcrypt.compare(

            password,

            user.password

        );


        // Wrong password
        if (!passwordMatch) {

            return res.status(401).send(
                "Invalid email or password"
            );

        }


        console.log(
            "Login successful:",
            user.email
        );
        // CREATE SESSION

        req.session.userId = user.id;

        req.session.username = user.username;

        req.session.email = user.email;


        // Save session
        req.session.save((error) => {

            if (error) {

                console.error(
                    "Session save error:",
                    error
                );

                return res.status(500).send(
                    "Could not create session"
                );

            }


            console.log(
                "Session created for:",
                user.email
            );


            res.status(200).json({

                message: "Login successful",

                username: user.username,

                email: user.email

            });

        });


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        res.status(500).send(
            "Server error"
        );

    }

});
// SESSION CHECK API
app.get("/api/auth/session", async (req, res) => {

    try {

        console.log(
            "Session userId:",
            req.session.userId
        );


        // Check session
        if (!req.session.userId) {

            return res.status(401).json({

                message: "Not logged in"

            });

        }


        // Get user
        const [users] = await pool.query(

            "SELECT id, username, email FROM users WHERE id = ?",

            [req.session.userId]

        );


        if (users.length === 0) {

            return res.status(401).json({

                message: "User not found"

            });

        }


        const user = users[0];


        res.status(200).json({

            loggedIn: true,

            username: user.username,

            email: user.email

        });


    } catch (error) {

        console.error(
            "Session Error:",
            error
        );

        res.status(500).json({

            message: "Server error"

        });

    }

});
// LOGOUT API
app.post("/api/auth/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "Logout Error:",
                error
            );

            return res.status(500).send(
                "Logout failed"
            );

        }


        // Clear session cookie
        res.clearCookie("login.sid");


        console.log(
            "User logged out"
        );


        res.status(200).send(
            "Logout successful"
        );

    });

});
// START SERVER
app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});