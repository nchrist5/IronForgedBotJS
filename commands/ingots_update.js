const { SlashCommandBuilder } = require('@discordjs/builders');
const { createSheetsClient, checkPermissions, getCellValue, updateCellValue, logChange } = require('../sheets_helper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updateingots')
    .setDescription('Update Ingots for a player')
    .addStringOption(option =>
      option
        .setName('player')
        .setDescription('The player to update ingots for')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('ingots')
        .setDescription('The new number of ingots')
        .setRequired(true)),
  async execute(interaction) {
    const hasPermission = await checkPermissions(interaction.member);
    if (hasPermission) {
      const playerName = interaction.options.getString('player');
      const newIngots = interaction.options.getInteger('ingots');

      const sheets = await createSheetsClient();

      const cellInfo = await getCellValue(sheets, `ClanIngots!A:B`, playerName.toLowerCase());

      if (cellInfo.value) {
        const previousIngots = parseInt(cellInfo.value);
        const updateSuccess = await updateCellValue(sheets, 'B', cellInfo.rowIndex, newIngots);
        if (updateSuccess) {
          const cmdCallingUser = await interaction.guild.members.fetch(interaction.user.id);
          await logChange(sheets, playerName, previousIngots, newIngots, cmdCallingUser.nickname);
          await interaction.editReply(`Updated ${playerName}'s ingots to ${newIngots.toLocaleString("en-US")} <:Ingot:1133172406538748024>\n(Previous Value: ${previousIngots.toLocaleString("en-US")} <:Ingot:1133172406538748024>)`);
        }
      } else {
        await interaction.editReply(`No data found for player: ${playerName}.`);
      }
    } else {
      await interaction.editReply(`Sorry! You don't have permission to use this command.`);
    }
  },
};
