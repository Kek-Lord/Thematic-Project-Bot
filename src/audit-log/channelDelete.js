const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        console.log('ChannelDelete event triggered');
        try {
            // fetch audit logs to determine who deleted the channel
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete,
            });

            // get the latest channel delete log
            const deleteLog = fetchedLogs.entries.first();

            // create the log message
            let logMessage = '**Channel Deleted**\n';

            if (!deleteLog || Date.now() - deleteLog.createdTimestamp > 5000) {
                logMessage += `**Channel:** ${channel.name} (${channel.id})\n` +
                              '**Deleted by:** Unknown';
            }
            else {
                const { executor } = deleteLog;
                logMessage += `**Channel:** ${channel.name} (${channel.id})\n` +
                              `**Channel Type:** ${channel.type}\n` +
                              `**Deleted by:** ${executor.tag} (${executor.id})`;
            }

            // find or create the admin channel
            let adminChannel = channel.guild.channels.cache.find(ch => ch.name === 'admin-bot-chat');
            if (!adminChannel) {
                try {
                    adminChannel = await channel.guild.channels.create({
                        name: 'admin-bot-chat',
                        // text channel
                        type: 0,
                        permissionOverwrites: [
                            // setting permissions for the channel
                            {
                                id: channel.guild.roles.everyone.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: channel.guild.members.me.roles.highest.id,
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
            console.error('Error in channelDelete event handler:', error);
        }
    },
};