const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// -------------------
// In-memory message store
// -------------------
const messageStore = [];

function storeMessage(msg) {
  messageStore.push({
    id: msg.id,
    content: msg.content,
    channelId: msg.channelId,
    guildId: msg.guildId,
  });
}

function searchMessages(word, limit) {
  return messageStore.filter(
    (msg) =>
      msg.content.toLowerCase().includes(word.toLowerCase()) &&
      msg.content.length >= limit
  );
}

// -------------------
// Slash command setup
// -------------------
const commands = [
  new SlashCommandBuilder()
    .setName("findmessage")
    .setDescription("Find messages with a keyword and minimum length")
    .addStringOption((option) =>
      option.setName("word").setDescription("Search keyword").setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName("limit").setDescription("Minimum word length").setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Slash commands registered ✅");
  } catch (err) {
    console.error(err);
  }
})();

// -------------------
// Bot Events
// -------------------
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (!message.author.bot && message.content) {
    storeMessage(message);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "findmessage") {
    const word = interaction.options.getString("word");
    const limit = interaction.options.getInteger("limit");

    const results = searchMessages(word, limit);

    if (results.length === 0) {
      await interaction.reply(`No messages found with "${word}" and limit >= ${limit}.`);
    } else {
      let reply = `🔎 Searching for keyword: **${word}** with limit: **${limit}**\n\n`;

      results.slice(0, 10).forEach((msg) => {
        const msgLink = `https://discord.com/channels/${msg.guildId}/${msg.channelId}/${msg.id}`;
        reply += `📌 [Message Link](${msgLink}) — \`${msg.content}\`\n`;
      });

      await interaction.reply(reply);
    }
  }
});

client.login(process.env.BOT_TOKEN);





/*const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
//console.log(process.env);
client.on("messageCreate", function (message) {
  if (message.author.bot) return;
  message.reply({ content: "Hello From Bot" });
});
client.login(process.env.BOT_TOKEN);

*/


/* gpt code accessing in web

const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
require("dotenv").config();

// -------------------
// In-memory storage
// -------------------
const messageStore = [];

function storeMessage(id, content) {
  messageStore.push({ id, content });
}

function searchMessages(word, maxLength) {
  return messageStore.filter(
    (msg) =>
      msg.content.toLowerCase().includes(word.toLowerCase()) &&
      msg.content.length <= maxLength
  );
}

// -------------------
// Discord Bot
// -------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (!message.author.bot && message.content) {
    storeMessage(message.id, message.content);
  }
});

client.login(process.env.BOT_TOKEN);

// -------------------
// Express API
// -------------------
const app = express();

app.get("/search", (req, res) => {
  const word = req.query.word;
  const limit = parseInt(req.query.limit, 10);

  if (!word || isNaN(limit)) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  const results = searchMessages(word, limit);
  res.json({ results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
});


*/