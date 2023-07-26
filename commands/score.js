const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const {skillList, preMaxSkillValue, postMaxSkillValue, minigameList, bossPointValue, getClanEmoji} = require('../pointValues.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('score')
		.setDescription('Replies with your clan score')
		.addStringOption(option =>
			option
				.setMaxLength(12)
				.setName('player')
				.setDescription('The player to rank')
				.setRequired(true)),
	async execute(interaction) {
		const username = interaction.options.getString("player");
		axios.get(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${username}`)
			.then(res => {
				const jagexPayload = res.data.split('\n').slice(1,-1);
				let skillPoints = 0;
				for (let i = 0; i < skillList.length; i++) {
					let skill = skillList[i];
					const skillData = jagexPayload[i].split(',');
					let xp = parseInt(skillData[2]);
					if (!isNaN(xp) && xp >= 0) {
						if (xp < 13034431) {
							skillPoints += Math.floor(xp / preMaxSkillValue[skill]);
						} else {
							skillPoints += Math.floor(13034431 / preMaxSkillValue[skill]) + Math.floor((xp - 13034431) / postMaxSkillValue[skill]);
						}
					}
				}

                let minigamePoints = 0;
                for (let i = 0; i < minigameList.length; i++) {
                    const minigameName = minigameList[i];
                    const playerKCdata = jagexPayload[skillList.length + i].split(',');
                    const kc = playerKCdata[1];
                    if (bossPointValue.hasOwnProperty(minigameName) && !isNaN(kc) && bossPointValue[minigameName] > 0 && kc / bossPointValue[minigameName] > 1.0) {
                        minigamePoints += Math.floor(kc / bossPointValue[minigameName]);
                    }
                }

				console.log(username + " - score");
				const totalPoints = skillPoints + minigamePoints;
				const iconID = getClanEmoji(totalPoints);
				const emoji = interaction.guild.emojis.cache.find(emoji => emoji.name === iconID);
				
				interaction.editReply(`\n${username} has ${totalPoints} points ${emoji}\nPoints from Skills: ${skillPoints}\nPoints from Minigames & Bossing: ${minigamePoints}`);
			})
			.catch(err => {
				interaction.editReply('Error: Invalid username or player not found.');
				console.log("Score called on " + username + ". Received error:\n" + err);
			});
	}
}
