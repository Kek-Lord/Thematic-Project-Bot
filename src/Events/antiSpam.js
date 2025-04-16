const { Events } = require('discord.js');

const spamTracker = new Map();

// SPAM_INTERVAL: Time window in milliseconds (e.g., 7000ms = 7 seconds)
// SPAM_THRESHOLD: Maximum allowed messages within the time window
const SPAM_INTERVAL = 10000;
const SPAM_THRESHOLD = 3;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages to avoid self-triggering spam checks
        if (message.author.bot) return;

        // Get the user's ID and the current timestamp
        const userId = message.author.id;
        const now = Date.now();

        // Retrieve existing message timestamps for the user, or use an empty array
        let timestamps = spamTracker.get(userId) || [];

        // Remove any timestamps outside of the defined SPAM_INTERVAL window
        timestamps = timestamps.filter(timestamp => now - timestamp < SPAM_INTERVAL);

        // Add the current timestamp to the array
        timestamps.push(now);

        // Update the spam tracker with the user’s current timestamps
        spamTracker.set(userId, timestamps);

        // If the user has sent more messages than allowed, warn them and delete the latest message
        if (timestamps.length > SPAM_THRESHOLD) {
            // Send a warning message to the user
            message.channel.send(`Hey <@${userId}>, you're sending messages too fast. Please slow down!`);

            // Deletes the message that triggered the spam detection
            message.delete().catch(console.error);
        }
    }
};
