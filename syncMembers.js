const { createSheetsClient, logChange, deleteRows, updateCellValue, appendRow, sortSheet } = require('./sheets_helper');
const dotenv = require('dotenv');
dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

async function syncServerMembersWithSheet(guild) {
  const sheets = await createSheetsClient();

  await sortSheet(sheets, 'ClanIngots', 0, 'ascending');
  await sortSheet(sheets, 'ChangeLog', 1, 'descending');

  const searchRange = 'ClanIngots!A:C';
  const searchResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: searchRange,
  });

  const existingMembers = searchResponse.data.values?.slice(1); //exclude header row

  await guild.members.fetch();
  const validMembers = guild.members.cache.filter((member) => {
    const hasValidNickname = /^[a-z0-9_ -]+$/i.test(member.nickname || member.user.username);
    const hasMemberRole = member.roles.cache.some((role) => role.name === 'Member');
    return hasValidNickname && hasMemberRole;
  });

  const rowsToDelete = [];

  for (const [index, row] of existingMembers.entries()) {
    const member = validMembers.find((m) => m.id === row[2]);
    if (!member) {
      const rowIndex = index + 1; //skip first row (header row)
      rowsToDelete.push(rowIndex);
    } else {
      const currentNickname = member.nickname ? member.nickname.toLowerCase() : member.user.username.toLowerCase();

      if (currentNickname.toLowerCase() !== row[0].toLowerCase()) {
        const rowIndex = index + 1; // Adjust index by +1 to account for header row
        try {
          const updateSuccess = await updateCellValue(sheets, 'A', rowIndex, currentNickname);
          if (updateSuccess) {
            console.log(`Updated ${row[0]} to ${currentNickname} in the sheet.`);
            await logChange(sheets, row[0], row[0], currentNickname, 'Name Change');
          }
        } catch (error) {
          console.error(`Error updating nickname for ${row[0]}:`, error);
        }
      }
    }      
  }

  rowsToDelete.sort((a, b) => b - a);

  if (rowsToDelete.length > 0) {
    //delete rows of members who left the server
    const deleteResult = await deleteRows(sheets, 'ClanIngots', rowsToDelete);

    if (deleteResult) {
      for (const rowIndex of rowsToDelete) {
        const rowData = searchResponse.data.values[rowIndex];
        console.log(`Removed ${rowData[0]} from the sheet (member left server).`);
        await logChange(sheets, rowData[0], rowData[1], 0, 'User Left Server');
      }
    }
  }

  for (const member of validMembers.values()) {
    const existsInSheet = existingMembers.some((row) => row[2] === member.id);
    if (!existsInSheet) {
      const nickname = member.nickname || member.user.username;
      const appendRange = 'ClanIngots!A:C';
      const appendSuccess = await appendRow(sheets, appendRange, [[nickname, 0, member.id]]);

      if (appendSuccess) {
        await logChange(sheets, nickname, 0, 0, 'User Joined Server');
        console.log(`Added ${nickname} to the sheet.`);
      }
    }
  }
  await sortSheet(sheets, 'ClanIngots', 0, 'ascending');
  await sortSheet(sheets, 'ChangeLog', 1, 'descending');
}

module.exports = syncServerMembersWithSheet;
