const { createSheetsClient, appendRow, logChange, deleteRows, sortSheet } = require('./sheets_helper');
const dotenv = require('dotenv');
dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

async function syncServerMembersWithSheet(guild) {

  const sheets = await createSheetsClient();

  await sortSheet(sheets, 'ClanIngots', 0, 'ascending');
  await sortSheet(sheets, 'ChangeLog', 1, 'descending');
  
  const searchRange = 'ClanIngots!A:B';
  const searchResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: searchRange,
  });

  const existingNames = searchResponse.data.values?.slice(1).map(row => row[0].toLowerCase()); //exclude header row, convert to lowercase

  await guild.members.fetch();
  const validMembers = guild.members.cache
    .filter((member) => /^[a-z0-9_ ]+$/i.test(member.nickname || member.user.username))
    .map((member) => (member.nickname || member.user.username).toLowerCase());
  
  const rowsToDelete = [];

  for (const [index, name] of existingNames.entries()) {
    const member = validMembers.find((m) => m === name);
    if (!member) {
      const rowIndex = index + 1; //skip first row (header row)
      rowsToDelete.push(rowIndex);

      //store the row data before deleting to write to changelog
      const rowData = searchResponse.data.values[rowIndex];

      console.log(`Removed ${name} from the sheet (member left server).`);

      await logChange(sheets, rowData[0], rowData[1], 0, 'UserLeftDiscordServer');
    }
  }

  rowsToDelete.sort((a, b) => b - a);

  if (rowsToDelete.length > 0) {
    //delete rows of members who left the server
    await deleteRows(sheets, 'ClanIngots', rowsToDelete, existingNames);
  }

  // Refresh the existing names after deletion
  const updatedSearchResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: searchRange,
  });
  const updatedExistingNames = updatedSearchResponse.data.values?.slice(1).map(row => row[0].toLowerCase()); //exclude header row, convert to lowercase

  for (const username of validMembers) {
    if (!existingNames.includes(username)) {
      // Add the user to the sheet and check for success
      const appendRange = 'ClanIngots!A:B';
      const appendSuccess = await appendRow(sheets, appendRange, [[username, 0]]);

      // If the append was successful, log the addition
      if (appendSuccess) {
        await logChange(sheets, username, 0, 0, 'UserAddedToDiscordServer');
        console.log(`Added ${username} to the sheet.`);
      }
    }
  }
}

module.exports = syncServerMembersWithSheet;
