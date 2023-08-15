const { SlashCommandBuilder } = require('@discordjs/builders');
const { createSheetsClient, getCellValue } = require('../sheets_helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ingots')
    .setDescription('View Ingots for a given player')
		.addStringOption(option =>
			option
				.setMaxLength(12)
				.setName('player')
				.setDescription('Name of player (RSN)')
				.setRequired(true)),

  async execute(interaction) {
    const playerName = interaction.options.getString('player');
    
    const sheets = await createSheetsClient();
    const range = `ClanIngots!A:B`;

    const cellInfo = await getCellValue(sheets, range, playerName.toLowerCase());
    if (cellInfo.value) {
      await interaction.editReply(`${playerName} has ${parseInt(cellInfo.value).toLocaleString("en-US")} ingots <:Ingot:1130689515372159136>`);
    } else {
      await interaction.editReply(`No data found for player: ${playerName}.`);
    }
  },
};