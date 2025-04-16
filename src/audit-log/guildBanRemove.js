const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildBanRemove,
    async execute(ban) {
        console.log('GuildBanRemove event triggered');
        try {
            // get the unbanned user
            const user = ban.user;

            // fetch the audit logs to determine who unbanned the user
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanRemove,
            });

            // get the latest unban log
            const unbanLog = fetchedLogs.entries.first();

            // create the log message
            let logMessage = '**User Unbanned**\n';

            if (!unbanLog || Date.now() - unbanLog.createdTimestamp > 5000) {
                logMessage += `**User:** ${user.tag} (${user.id})\n` +
                             '**Unbanned by:** Unknown';
            }
            else {
                const { executor, target } = unbanLog;

                // verify this log is for the right user
                if (target.id === user.id) {
                    logMessage += `**User:** ${user.tag} (${user.id})\n` +
                                 `**Unbanned by:** ${executor.tag} (${executor.id})`;
                }
                else {
                    logMessage += `**User:** ${user.tag} (${user.id})\n` +
                                 '**Unbanned by:** Unknown';
                }
            }

            // find or create the admin channel
            let adminChannel = ban.guild.channels.cache.find(channel => channel.name === 'admin-bot-chat');
            if (!adminChannel) {
                try {
                    adminChannel = await ban.guild.channels.create({
                        name: 'admin-bot-chat',
                        // text channel
                        type: 0,
                        permissionOverwrites: [
                            // setting permissions for the channel
                            {
                                id: ban.guild.roles.everyone.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: ban.guild.members.me.roles.highest.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                        ],
                    });
                    console.log('admin-bot-chat channel created successfully.');
                }
                catch (error) {
                    console.error('Failed to create admin-bot-chat channel:', error);
                    return;
                }
            }

            // send the log message to the admin channel
            await adminChannel.send(logMessage);
        }
        catch (error) {
            console.error('Error in guildBanRemove event handler:', error);
        }
    },
};