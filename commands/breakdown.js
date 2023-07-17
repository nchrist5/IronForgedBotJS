const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const {skillList, preMaxSkillValue, postMaxSkillValue, minigameList, bossPointValue, getClanEmoji} = require('../pointValues.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('breakdown')
        .setDescription('Replies with your score breakdown')
        .addStringOption(option =>
            option
                .setMaxLength(12)
                .setName('player')
                .setDescription('The player to get a breakdown')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString("player");
        axios.get(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${username}`)
            .then(res => {
                const jagexPayload = res.data.split('\n').slice(1,-1);
                let playerSkillsData = {};
				let skillPoints = 0;
				for (let i = 0; i < skillList.length; i++) {
					let skill = skillList[i];
					const playerXPdata = jagexPayload[i].split(',');
					let xp = parseInt(playerXPdata[2]);
					if (!isNaN(xp) && xp >= 0) {
						if (xp < 13034431) {
							playerSkillsData[skill] = Math.floor(xp / preMaxSkillValue[skill]);
						} else {
							playerSkillsData[skill] = Math.floor(13034431 / preMaxSkillValue[skill]) + Math.floor((xp - 13034431) / postMaxSkillValue[skill]);
						}
                        skillPoints += playerSkillsData[skill];
					}
				}

                let playerMinigameData = {};
                let minigamePoints = 0;
                for (let i = 0; i < minigameList.length; i++) {
                    const minigameName = minigameList[i];
                    const playerKCdata = jagexPayload[skillList.length + 1 + i].split(',');
                    const kc = playerKCdata[1];
                    if (bossPointValue.hasOwnProperty(minigameName) && !isNaN(kc) && bossPointValue[minigameName] > 0 && kc / bossPointValue[minigameName] > 1.0) {
                        playerMinigameData[minigameName] = Math.floor(kc / bossPointValue[minigameName]);
                        minigamePoints += playerMinigameData[minigameName];
                    }
                }
                
                const totalPoints = skillPoints + minigamePoints;
				const iconID = getClanEmoji(totalPoints);
                const emoji = interaction.guild.emojis.cache.find(emoji => emoji.name === iconID);
                
                let skillPointsOutput = Object.entries(playerSkillsData)
                    .map(([key, value]) => `${key} : ${value}\n`)
                    .join('');

                let minigameOutput = Object.entries(playerMinigameData)
                    .map(([key, value]) => `${key} : ${value}\n`)
                    .join('');

				let skillPointsOutPercent = Math.round((skillPoints/totalPoints)*100);
				let minigameOutPercent = Math.round((minigamePoints/totalPoints)*100);

                let breakdownOutput = `---Points from Skills---\n${skillPointsOutput}Total Skill Points: ${skillPoints} (${skillPointsOutPercent}% of total)\n\n---Points from Minigames & Bossing---\n${minigameOutput}Total Minigame & Bossing Points: ${minigamePoints} (${minigameOutPercent}% of total)\n\nTotal Points: ${totalPoints}`;
                
                fs.writeFile("./output_files/breakdown.txt", breakdownOutput, function (err) {
                    if (err) {
						interaction.editReply('Error: Invalid username or player not found.');
                        console.log("Breakdown called on " + username + ". Received error:\n" + err);
                    } else {
                        console.log(username + " - breakdown");
                        interaction.editReply({
                            files : ['./output_files/breakdown.txt'],
                            content: `\n\n${username}'s Total Points:  ${totalPoints}  ${emoji}`
                        });
                    }
                });
            })
    }
}
