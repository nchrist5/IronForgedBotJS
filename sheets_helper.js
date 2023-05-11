const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

async function createSheetsClient() {
  const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsContent);

  const client = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  await client.authorize();
  return google.sheets({ version: 'v4', auth: client });
}

//THROTTLE SETUP//
const maxOperationsPerMinute = 100;
const interval = (60 / maxOperationsPerMinute) * 1000; //interval based on maxOperationsPerMinute ~1.67 op/sec
const requestQueue = [];
let isProcessingQueue = false;

function addRequestToQueue(request) {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      request: request,
      resolve: resolve,
      reject: reject
    });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  const requestWrapper = requestQueue.shift();
  try {
    const result = await requestWrapper.request();
    requestWrapper.resolve(result);
  } catch (err) {
    console.error('Error processing request in queue:', err);
    requestWrapper.reject(err);
  }
  setTimeout(() => {
    isProcessingQueue = false;
    processQueue();
  }, interval);
}



//END THROTTLE SETUP//

async function checkPermissions(member) {
  console.log(`Checking permissions for member: ${member.user.tag}`);
  await member.guild.roles.fetch();
  const leadershipRole = member.guild.roles.cache.find(role => role.name === 'Leadership');
  console.log(`Leadership role found: ${Boolean(leadershipRole)}`);
  if (!leadershipRole) {
    console.log('Leadership role does not exist');
    return false;
  }
  if (!member.roles.cache.has(leadershipRole.id)) {
    console.log(member + ' does not have Leadership role');
    return false;
  }
  console.log(member + ' has Leadership role');
  return true;
}


//returns object containing player's rowIndex and ingot value
async function getCellValue(sheets, range, playerName) {
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges: [range],
  });
  
  //set rowIndex as invalid, modify if not
  let rowIndex = -1;
  const rows = response.data.valueRanges[0].values;
  
  for (const [index, row] of rows.entries()) {
    if (row[0] === playerName) {
      rowIndex = index;
      break;
    }
  }

  return {
    rowIndex: rowIndex,
    value: rowIndex !== -1 ? rows[rowIndex][1] : null,
  };
}

async function appendRow(sheets, range, values) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values,
      },
    });
      return true;
  } catch (error) {
      console.error(`Error appending row: ${error}`);
      return false;
  }
}


async function updateCellValue(sheets, column, rowIndex, value) {
  if (rowIndex === -1) {
    console.error(`Player not found in the sheet.`);
    return false;
  }

  const range = `ClanIngots!${column}${rowIndex + 1}`;

  return await addRequestToQueue(() => {
    return new Promise(async (resolve, reject) => {
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range,
          valueInputOption: 'RAW',
          resource: {
            values: [[value]],
          },
        });
        resolve(true);
      } catch (error) {
        console.error(`Error updating cell:`, error);
        reject(false);
      }
    });
  });
}


async function deleteRows(sheets, sheetName, rowIndices) {
  const sheetId = await getSheetId(sheets, sheetName);
  if (sheetId === null) {
    console.error(`Sheet "${sheetName}" not found.`);
    return false;
  }

  const requests = rowIndices.map((rowIndex) => ({
    deleteDimension: {
      range: {
        sheetId: sheetId,
        dimension: 'ROWS',
        startIndex: rowIndex,
        endIndex: rowIndex + 1,
      },
    },
  }));

  const success = await addRequestToQueue(() => {
    return new Promise(async (resolve, reject) => {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            requests: requests,
          },
        });
          resolve(true);
      } catch (error) {
          console.error('Error deleting rows:', error);
          reject(false);
      }
    });
  });

  return success;
}


//used for API interactions requiring an integer rather than sheet name
async function getSheetId(sheets, sheetName) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const sheet = response.data.sheets.find(sheet => sheet.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}


async function sortSheet(sheets, sheetName, sortDimensonIndex, sortOrder = 'ascending') {
  const sheetId = await getSheetId(sheets, sheetName);
  if (sheetId === null) {
    console.error(`Sheet "${sheetName}" not found.`);
    return;
  }

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId: sheetId,
                startRowIndex: 1,
                startColumnIndex: 0,
              },
              sortSpecs: [
                {
                  dimensionIndex: sortDimensonIndex,
                  sortOrder: sortOrder,
                },
              ],
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error sorting sheet:', error);
  }
}

//write ingot changes to ChangeLog sheet
async function logChange(sheets, playerName, ingotsPrevious, ingotsNew, updatedBy) {
  const currentTime = new Date();

  const timeZone = 'America/New_York';
  const estDate = new Date(currentTime.toLocaleString('en-US', { timeZone }));
  const timestamp = estDate.toLocaleString('en-US');

  const changeLogRange = 'ChangeLog!A:E';
  const changeLogRow = {
    values: [
      [playerName, timestamp, ingotsPrevious, ingotsNew, updatedBy]
    ],
  };

  return await addRequestToQueue(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: changeLogRange,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: changeLogRow,
        });
          resolve(true);
      } catch (error) {
          console.error('Error logging change:', error);
          reject(false);
      }
    });
  });
}



module.exports = { createSheetsClient, checkPermissions, getCellValue, appendRow, updateCellValue, deleteRows, sortSheet, logChange };