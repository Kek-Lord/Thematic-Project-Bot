const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top users by level and XP.'),
    async execute(interaction) {
        // Import the database functions to retrieve leaderboard data.
        const db = require('../../database/database.js');
        try {
            // Fetch the top 10 users based on their level and XP.
            const leaderboard = await db.getLeaderboard(10);
            // Start constructing the reply message with a header.
            let reply = 'Leaderboard:\n';
            // Loop through the leaderboard results and append each user’s stats.
            leaderboard.forEach((row, index) => {
                reply += `${index + 1}. <@${row.userId}> - Level: ${row.level}, XP: ${row.xp}, Coins: ${row.currency}\n`;
            });
            // Send the final leaderboard message.
            await interaction.reply({ content: reply, flags: 64 });
        } catch (err) {
            // Log any errors and respond with an error message.
            console.error(err);
            await interaction.reply({ content: 'Error fetching leaderboard.', flags: 64 });
        }
    }
};
