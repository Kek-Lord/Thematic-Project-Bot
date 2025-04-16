const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role) {
        console.log('GuildRoleDelete event triggered');
        try {
            // fetch audit logs to determine who deleted the role
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleDelete,
            });

            // get the latest role delete log
            const deleteLog = fetchedLogs.entries.first();

            // create the log message
            let logMessage = '**Role Deleted**\n';

            // check if the log exists and is recent
            if (!deleteLog || Date.now() - deleteLog.createdTimestamp > 5000) {
                logMessage += `**Role:** ${role.name} (${role.id})\n` +
                             `**Color:** ${role.hexColor}\n` +
                             '**Deleted by:** Unknown';
            }
            else {
                const { executor } = deleteLog;
                logMessage += `**Role:** ${role.name} (${role.id})\n` +
                             `**Color:** ${role.hexColor}\n` +
                             `**Position:** ${role.position}\n` +
                             `**Deleted by:** ${executor.tag} (${executor.id})`;
            }

            // find or create the admin channel
            let adminChannel = role.guild.channels.cache.find(channel => channel.name === 'admin-bot-chat');
            if (!adminChannel) {
                try {
                    adminChannel = await role.guild.channels.create({
                        name: 'admin-bot-chat',
                        // text channel
                        type: 0,
                        permissionOverwrites: [
                            // setting permissions for the channel
                            {
                                id: role.guild.roles.everyone.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: role.guild.members.me.roles.highest.id,
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
            console.error('Error in roleDelete event handler:', error);
        }
    },
};