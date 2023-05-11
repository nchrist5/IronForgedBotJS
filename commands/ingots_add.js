const { SlashCommandBuilder } = require('@discordjs/builders');
const { createSheetsClient, checkPermissions, getCellValue, updateCellValue, logChange } = require('../sheets_helper');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('addingots')
    .setDescription('Add Ingots to a player')
    .addStringOption(option =>
      option
        .setName('player')
        .setDescription('The player to add ingots to')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('ingots')
        .setDescription('The number of ingots to add')
        .setRequired(true)),
  async execute(interaction) {
    const hasPermission = await checkPermissions(interaction.member);
    if (hasPermission) {

      const playerName = interaction.options.getString('player');
      const ingotsToAdd = interaction.options.getInteger('ingots');

      const sheets = await createSheetsClient();

      const cellInfo = await getCellValue(sheets, `ClanIngots!A:B`, playerName.toLowerCase());

      const newIngots = parseInt(cellInfo.value) + ingotsToAdd;
      const updateSuccess = await updateCellValue(sheets, 'B', cellInfo.rowIndex, newIngots);
      if (cellInfo.value && updateSuccess) {
        const cmdCallingUser = await interaction.guild.members.fetch(interaction.user.id);
        await logChange(sheets, playerName, parseInt(cellInfo.value), newIngots, cmdCallingUser.nickname );
        await interaction.editReply(`Added ${ingotsToAdd} ingots to ${playerName}. They now have ${newIngots} ingots.`);
      } else {
        await interaction.editReply(`No data found for player: ${playerName}.`);
      }
    } else {
      await interaction.editReply({ content: `Sorry! You don't have permission to use this command.`, ephemeral: true });
    }
    },
};
