require('dotenv').config(); // Load .env variables
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Map to track ongoing games per user
const games = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    // Start a game
    if (command === '!startgame') {
        if (games.has(message.author.id)) {
            message.channel.send('You already have a game running!');
            return;
        }
        const number = Math.floor(Math.random() * 100) + 1;
        games.set(message.author.id, number);
        message.channel.send('🎲 I picked a number between 1 and 100. Try to guess it using `!guess <number>`!');
    }

    // Make a guess
    if (command === '!guess') {
        if (!games.has(message.author.id)) {
            message.channel.send('You need to start a game first with `!startgame`!');
            return;
        }
        const guess = parseInt(args[0]);
        if (isNaN(guess)) {
            message.channel.send('That is not a valid number!');
            return;
        }
        const number = games.get(message.author.id);
        if (guess === number) {
            message.channel.send(`🎉 Correct! The number was ${number}.`);
            games.delete(message.author.id);
        } else if (guess < number) {
            message.channel.send('📉 Too low!');
        } else {
            message.channel.send('📈 Too high!');
        }
    }

    // End a game
    if (command === '!endgame') {
        if (games.has(message.author.id)) {
            games.delete(message.author.id);
            message.channel.send('Game ended.');
        } else {
            message.channel.send('You have no game running.');
        }
    }
});

// Use token from .env
client.login(process.env.DISCORD_TOKEN);
