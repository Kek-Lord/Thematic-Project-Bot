const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

// Define the database file path using the current directory and the file name.
const dbPath = path.join(__dirname, 'leveling.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database:', err);
    else {
        console.log('Database connected.');
        // Create the 'users' table, with columns for leveling information and currency.
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                userId TEXT PRIMARY KEY,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                messages INTEGER DEFAULT 0,
                streak INTEGER DEFAULT 0,
                lastMessage INTEGER DEFAULT 0,
                currency INTEGER DEFAULT 0,
                lastDaily INTEGER DEFAULT 0
            )
        `, (err) => {
            if (err) console.error('Error creating table:', err);
        });
    }
});

// Retrieve a user's record from the database.
function getUser(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE userId = ?`, [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Create a new user record with default values.
function createUser(userId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (userId) VALUES (?)`, [userId], function(err) {
            if (err) reject(err);
            else resolve({
                userId,
                xp: 0,
                level: 1,
                messages: 0,
                streak: 0,
                lastMessage: 0,
                currency: 0,
                lastDaily: 0,
            });
        });
    });
}

// Update an existing user record with new data.
function updateUser(user) {
    return new Promise((resolve, reject) => {
        const { userId, xp, level, messages, streak, lastMessage, currency, lastDaily } = user;
        db.run(`
            UPDATE users 
            SET xp = ?, level = ?, messages = ?, streak = ?, lastMessage = ?, currency = ?, lastDaily = ?
            WHERE userId = ?`,
            [xp, level, messages, streak, lastMessage, currency, lastDaily, userId],
            function (err) {
                if (err) reject(err);
                else resolve(true);
            });
    });
}

// Function to calculate the required XP for the next level using an advanced leveling formula.
// Formula: required XP = floor(100 * level^1.7 + 50)
function xpForNextLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.7) + 50);
}

// Helper function that converts a given timestamp to the start of that day (midnight).
function getStartOfDay(timestamp) {
    const d = new Date(timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

// Adds XP to the user based on activity, and also handles daily streak logic and level-ups.
async function addXP(userId, xpToAdd) {
    let user = await getUser(userId);
    if (!user) user = await createUser(userId);

    const now = Date.now();
    const todayMidnight = getStartOfDay(now);
    const lastMsgMidnight = getStartOfDay(user.lastMessage);

    // Increment the total message count.
    user.messages += 1;

    // Determine the daily streak:
    // - If no previous message, initialize streak to 1.
    // - If the message is on the same day, do nothing.
    // - If exactly one day has passed, increment the streak.
    // - Otherwise, reset the streak to 1.
    if (user.lastMessage === 0) {
        // New user or no recorded messages yet
        user.streak = 1;
    } else if (todayMidnight === lastMsgMidnight) {
        // Same day: no streak increment.
    } else if (todayMidnight - lastMsgMidnight === 24 * 60 * 60 * 1000) {
        // Exactly one day difference -> consecutive daily streak
        user.streak += 1;
    } else {
        // More than one day has passed
        user.streak = 1;
    }

    // Update the last message timestamp to now.
    user.lastMessage = now;

    // Add the specified XP to the user's XP total.
    user.xp += xpToAdd;

    // Handle level-up logic:
    // Subtract the required XP repeatedly until the user no longer has enough XP for another level,
    // increasing the level and awarding additional currency with each level-up.
    let leveledUp = false;
    while (user.xp >= xpForNextLevel(user.level)) {
        user.xp -= xpForNextLevel(user.level);
        user.level += 1;
        leveledUp = true;
        // Award bonus coins upon leveling up.
        user.currency += 50;
    }

    // Save the updated user data to the database.
    await updateUser(user);
    return { user, leveledUp };
}

// Function to claim the daily bonus.
// Checks if the bonus was already claimed in the past 24 hours.
// If eligible, awards bonus XP and coins, and updates the lastDaily timestamp.
async function claimDailyBonus(userId) {
    let user = await getUser(userId);
    if (!user) user = await createUser(userId);

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - user.lastDaily < oneDay) {
        return { success: false, message: "You already claimed your daily bonus." };
    } else {
        const bonus = 10;
        user.currency += bonus;
        user.lastDaily = now;
        await updateUser(user);
        return { success: true, bonus, user };
    }
}

// Retrieve the top users ordered by level and then XP (for the leaderboard).
function getLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT userId, level, xp, currency 
            FROM users 
            ORDER BY level DESC, xp DESC 
            LIMIT ?`, [limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    xpForNextLevel,
    addXP,
    claimDailyBonus,
    getLeaderboard
};
