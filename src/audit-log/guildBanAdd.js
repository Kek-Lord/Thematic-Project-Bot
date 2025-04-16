const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        console.log('GuildBanAdd event triggered');
        try {
            // get the banned user
            const user = ban.user;

            // fetch the audit logs to determine who banned the user
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });

            // get the latest ban log
            const banLog = fetchedLogs.entries.first();

            // create the log message
            let logMessage = '**User Banned**\n';

            if (!banLog || Date.now() - banLog.createdTimestamp > 5000) {
                logMessage += `**User:** ${user.tag} (${user.id})\n` +
                             '**Banned by:** Unknown';
            }
            else {
                const { executor, reason, target } = banLog;

                // verify this log is for the right user
                if (target.id === user.id) {
                    logMessage += `**User:** ${user.tag} (${user.id})\n` +
                                 `**Banned by:** ${executor.tag} (${executor.id})\n` +
                                 `**Reason:** ${reason || 'No reason provided'}`;
                }
                else {
                    logMessage += `**User:** ${user.tag} (${user.id})\n` +
                                 '**Banned by:** Unknown';
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
            console.error('Error in guildBanAdd event handler:', error);
        }
    },
};