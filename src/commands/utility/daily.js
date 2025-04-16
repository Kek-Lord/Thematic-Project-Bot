const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily currency bonus!'),
    async execute(interaction) {
        // Import the database functions needed to handle the daily bonus.
        const db = require('../../database/database.js');
        try {
            // Attempt to claim the daily bonus for the user.
            const result = await db.claimDailyBonus(interaction.user.id);
            // If claiming is unsuccessful, send an ephemeral reply with the error message.
            if (!result.success) {
                await interaction.reply({ content: result.message, flags: 64 });
            } else {
                // Reply with a confirmation message specifying the bonus coins awarded.
                await interaction.reply(`You've claimed your daily bonus of ${result.bonus} coins!`);
            }
        } catch (err) {
            // Log any errors and reply with a generic error message.
            console.error(err);
            await interaction.reply({ content: 'There was an error processing your daily bonus.', flags: 64 });
        }
    }
};
