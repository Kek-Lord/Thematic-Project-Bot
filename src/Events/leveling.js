const db = require('../database/database.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore any messages sent by bots to prevent infinite loops or unintended behavior.
        if (message.author.bot) return;

        // For each valid message, add a set amount of XP (in this case, 10 XP).
        // The addXP function also handles the logic for level-ups and daily streaks.
        try {
            const { user, leveledUp } = await db.addXP(message.author.id, 10);
            // If the user has leveled up, notify them in the channel.
            if (leveledUp) {
                message.channel.send(`Congratulations <@${message.author.id}>, you are now level ${user.level}!`);
            }
        } catch (err) {
            // Log any errors that occur during the XP update process.
            console.error("Error updating XP:", err);
        }
    }
};
