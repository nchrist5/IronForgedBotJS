// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const syncServerMembersWithSheet = require('./syncMembers');

const dotenv = require('dotenv');
dotenv.config();
const token = process.env.token;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command) {
        client.commands.set(command.data.name, command);
    }
}
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {

    console.log(`Ready! Logged in as ${c.user.tag}`);

});
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;
    console.log(`Received command: ${interaction.commandName}`);
  
    const command = client.commands.get(interaction.commandName);
  
    if (!command) {
      console.log(`Command not found: ${interaction.commandName}`);
      console.log("Registered commands:", client.commands.keys());
      return;
    }

    try {
        await interaction.deferReply();
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

    //sync members to spreadsheet
    await syncServerMembersWithSheet(interaction.guild);
});
client.login(token)
