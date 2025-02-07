# Thematic Project Bot

This is a Discord bot designed for the thematic project. Follow the steps below to clone and set up the bot on your own machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)
- A Discord bot token (from the [Discord Developer Portal](https://discord.com/developers/applications))

## Cloning the Repository

To get a copy of this bot, open your terminal and run:

```bash
# Clone the repository
git clone https://github.com/Kek-Lord/Thematic-Project-Bot.git

# Navigate into the project folder
cd Thematic-Project-Bot
```

## Installing Dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

## Getting Your Discord Bot Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and give it a name.
3. Navigate to the **Bot** tab and click **Add Bot**.
4. Under the **Token** section, click **Reset Token** and copy the generated token.
5. Store this token securely, as it will be used to authenticate your bot.

## Configuration

1. Create a `.env` file in the root directory and add your bot token:

```
DISCORD_TOKEN=your-bot-token-here
```

2. (Optional) Configure other environment variables if needed.

## Running the Bot

To start the bot, use the following command:

```bash
node index.js
```

Or, if you're using nodemon for development:

```bash
npx nodemon index.js
```

## What does this bot do so far?

At the minute, the only functionality is when you type "hello" (without the quotes), it respondes with "Hello!"

## Additional notes

If you find your editor is complaining at you about formatting, you can delete the eslint.config.js file and it should fix any issues

## Contributing

As this is a group project, this just sets the bot up, I'll also be working on a commands handler (to handle slash commands),
and from there, we can implement actual functionality to the bot. Make sure to pull this repo every so often so you can stay the most up to date on the bot development.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

