require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = 3000;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.login(process.env.BOT_TOKEN);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'supersecret', resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', async (req, res) => {
    res.render('index', {
        botName: client.user.username,
        servers: client.guilds.cache.size,
        users: client.users.cache.size,
        user: req.user
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.user) return res.redirect('/login');
    res.render('dashboard', { user: req.user, guilds: req.user.guilds });
});

app.listen(port, () => console.log(`Weboldal fut a http://localhost:${port} címen`));
