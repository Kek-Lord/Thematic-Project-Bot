const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/database.js');

// Set the currency cost for a role colour change
const COST = 500;

// Define a mapping for common colour names to their respective hex codes,
// which allows users to simply type a name instead of a hex value.
const namedColours = {
  red: "#FF0000",
  blue: "#0000FF",
  green: "#00FF00",
  yellow: "#FFFF00",
  purple: "#800080",
  pink: "#FFC0CB",
  orange: "#FFA500",
  white: "#FFFFFF",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('customrolecolour')
    .setDescription('Change the colour of your custom role for a fee.')
    .addStringOption(option =>
      option.setName('colour')
        .setDescription('Enter a hex colour (e.g., #FF5733) or a common colour name (e.g., red, blue)')
        .setRequired(true)
    ),
  async execute(interaction) {
    // Retrieve and trim the user's input for the colour option.
    const colourInput = interaction.options.getString('colour').trim();

    // Regular expression to validate a 6-digit hex code (with or without a leading #)
    const hexRegex = /^#?([A-Fa-f0-9]{6})$/;
    let colour;       // This variable will hold the final hex value for the role colour.
    let displayName;  // Used to display the colour or name in the role name.

    // Check if the input matches the hex code format.
    if (hexRegex.test(colourInput)) {
      // Extract the valid hex digits and prepend '#' if missing.
      const match = hexRegex.exec(colourInput);
      colour = `#${match[1]}`;
      displayName = colour; // Use the hex code as the display name (e.g., "#FF5733")
    } else {
      // Convert input to lowercase and check if it exists in our namedColours mapping.
      const lowerInput = colourInput.toLowerCase();
      if (namedColours[lowerInput]) {
        colour = namedColours[lowerInput]; // Retrieves the corresponding hex code.
        displayName = lowerInput;          // Uses the colour name for display (e.g., "red")
      } else {
        // Reply with an error message if neither a valid hex nor a recognized name is provided.
        return interaction.reply({ 
          content: "Invalid colour. Provide a 6-digit hex code (e.g., #FF5733) or a recognized name (e.g., red, blue).",
          flags: 64 // ephemeral: Only the user can see this message.
        });
      }
    }

    // Retrieve the user's data from the database. Create a new record if it doesn't exist.
    let userData = await db.getUser(interaction.user.id);
    if (!userData) {
      userData = await db.createUser(interaction.user.id);
    }

    // Check if the user has enough coins to pay the COST.
    if (userData.currency < COST) {
      return interaction.reply({ 
        content: `You need at least ${COST} coins, but you only have ${userData.currency} coins.`,
        flags: 64
      });
    }

    // Deduct the cost from the user's currency and update their record.
    userData.currency -= COST;
    await db.updateUser(userData);

    // Ensure that the command is executed in a guild context and that the member object can be retrieved.
    const member = interaction.member;
    if (!member) {
      return interaction.reply({ 
        content: "Error retrieving your member information.", 
        flags: 64
      });
    }

    // Set up a custom role name based on the colour input.
    const customRoleName = `${displayName}`;

    // Attempt to find an existing custom role for the user by checking if a role's name starts with the user's ID.
    let role = interaction.guild.roles.cache
      .find(r => r.name.startsWith(`${interaction.user.id}`));

    try {
      if (!role) {
        // Create a new role if none exists, including setting the name, colour, and reason for audit logs.
        role = await interaction.guild.roles.create({
          name: customRoleName,
          color: colour,
          reason: `Custom role colour created for ${interaction.user.tag}`,
        });
        // Add the newly created role to the member.
        await member.roles.add(role);
      } else {
        // If the role exists, update its name and colour.
        await role.setName(customRoleName, `Renamed by ${interaction.user.tag}`);
        await role.setColor(colour, `Colour updated by ${interaction.user.tag}`);
      }

      // Acknowledge the successful update by informing the user of the role name, colour, and the cost deduction.
      return interaction.reply({ 
        content: `Your role name is now \`${customRoleName}\`, the colour is ${colour}, and ${COST} coins have been deducted.`,
        flags: 64
      });
    } catch (error) {
      // Log any errors and notify the user that something went wrong.
      console.error("Error updating custom role colour:", error);
      return interaction.reply({ 
        content: "Error updating your role colour. Please try again later.", 
        flags: 64
      });
    }
  }
};
