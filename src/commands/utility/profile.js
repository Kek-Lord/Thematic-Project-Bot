const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your leveling profile.'),
    async execute(interaction) {
        try {
            // Attempt to retrieve the user's data from the database.
            const userData = await db.getUser(interaction.user.id);
            if (!userData) {
                // If the user does not exist in the database, prompt them to start chatting.
                return interaction.reply({
                    content: "You haven't started leveling yet. Start chatting to create your profile!",
                    flags: 64,
                });
            }
            
            // Construct an embed containing the user's leveling data.
            const profileEmbed = {
                color: 0x0099ff,
                title: `${interaction.user.username}'s Profile`,
                fields: [
                    { name: 'Level', value: userData.level.toString(), inline: true },
                    { name: 'XP', value: userData.xp.toString(), inline: true },
                    { name: 'Messages Sent', value: userData.messages.toString(), inline: true },
                    { name: 'Daily Streak', value: userData.streak.toString(), inline: true },
                    { name: 'Currency', value: userData.currency.toString(), inline: true },
                ],
                timestamp: new Date(),
                footer: { text: 'Keep chatting to level up!' },
            };
            // Send the profile embed as an ephemeral reply so only the user can view it.
            await interaction.reply({ embeds: [profileEmbed], flags: 64 });
        } catch (err) {
            // Log any potential errors and inform the user.
            console.error(err);
            await interaction.reply({ content: 'Error retrieving your profile.', flags: 64 });
        }
    }
};
