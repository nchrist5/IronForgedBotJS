const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

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
		const skillList = ["Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecraft", "Hunter", "Construction"];
		//PRE-99 Points per EXP
		const preMaxModifier = {
			"Attack": 100000,
			"Defence": 100000,
			"Strength": 100000,
			"Hitpoints": 100000,
			"Ranged": 100000,
			"Prayer": 33333,
			"Magic": 50000,
			"Cooking": 100000,
			"Woodcutting": 50000,
			"Fletching": 100000,
			"Fishing": 50000,
			"Firemaking": 100000,
			"Crafting": 33333,
			"Smithing": 50000,
			"Mining": 33333,
			"Herblore": 25000,
			"Agility": 33333,
			"Thieving": 100000,
			"Slayer": 33333,
			"Farming": 50000,
			"Runecraft": 33333,
			"Hunter": 50000,
			"Construction": 50000,
		}
		//POST-99 Points per EXP
		const postMaxModifer = {
			"Attack": 333333,
			"Defence": 333333,
			"Strength": 333333,
			"Hitpoints": 333333,
			"Ranged": 333333,
			"Prayer": 111111,
			"Magic": 166666,
			"Cooking": 100000,
			"Woodcutting": 50000,
			"Fletching": 100000,
			"Fishing": 50000,
			"Firemaking": 100000,
			"Crafting": 33333,
			"Smithing": 50000,
			"Mining": 33333,
			"Herblore": 25000,
			"Agility": 33333,
			"Thieving": 100000,
			"Slayer": 33333,
			"Farming": 50000,
			"Runecraft": 33333,
			"Hunter": 50000,
			"Construction": 50000,
		}		
		const minigameList = ["Bounty Hunter - Hunter", "Bounty Hunter - Rogue", "Clue Points (all)", "Clue Scrolls (beginner)", "Clue Scrolls (easy)", "Clue Scrolls (medium)", "Clue Scrolls (hard)", "Clue Scrolls (elite)", "Clue Scrolls (master)", "LMS - Rank", "PvP Arena - Rank", "Soul Wars Zeal", "Rifts closed", "Abyssal Sire", "Alchemical Hydra", "Artio", "Barrows Chests", "Bryophyta", "Callisto", "Calvar'ion", "Cerberus", "Chambers of Xeric", "Chambers of Xeric: Challenge Mode", "Chaos Elemental", "Chaos Fanatic", "Commander Zilyana", "Corporeal Beast", "Crazy Archaeologist", "Dagannoth Prime", "Dagannoth Rex", "Dagannoth Supreme", "Deranged Archaeologist", "General Graardor", "Giant Mole", "Grotesque Guardians", "Hespori", "Kalphite Queen", "King Black Dragon", "Kraken", "Kree'Arra", "K'ril Tsutsaroth", "Mimic", "Nex", "Nightmare", "Phosani's Nightmare", "Obor", "Phantom Muspah", "Sarachnis", "Scorpia", "Skotizo", "Spindel", "Tempoross", "The Gauntlet", "The Corrupted Gauntlet", "Theatre of Blood", "Theatre of Blood: Hard Mode", "Thermonuclear Smoke Devil", "Tombs of Amascut", "Tombs of Amascut: Expert Mode", "TzKal-Zuk", "TzTok-Jad", "Venenatis", "Vet'ion", "Vorkath", "Wintertodt", "Zalcano", "Zulrah"]		
		const minigameEHB = {
			"Bounty Hunter - Hunter": 1,
			"Bounty Hunter - Rogue": 1,
			"Clue Scrolls (all)": 1,
			"Clue Scrolls (beginner)": 1,
			"Clue Scrolls (easy)": 1,
			"Clue Scrolls (medium)": 1,
			"Clue Scrolls (hard)": 1,
			"Clue Scrolls (elite)": 1,
			"Clue Scrolls (master)": 1,
			"LMS - Rank": 1,
			"PvP Arena - Rank": 1,
			"Soul Wars Zeal": 1,
			"Rifts closed": 7,
			"Abyssal Sire": 32,
			"Alchemical Hydra": 26,
			"Artio": 0,
			"Barrows Chests": 18,
			"Bryophyta": 3,
			"Callisto": 30,
			"Calvar'ion": 0,
			"Cerberus": 54,
			"Chambers of Xeric": 2.8,
			"Chambers of Xeric: Challenge Mode": 2,
			"Chaos Elemental": 48,
			"Chaos Fanatic": 80,
			"Commander Zilyana": 25,
			"Corporeal Beast": 6.5,
			"Crazy Archaeologist": 75,
			"Dagannoth Prime": 88,
			"Dagannoth Rex": 88,
			"Dagannoth Supreme": 88,
			"Deranged Archaeologist": 80,
			"General Graardor": 25,
			"Giant Mole": 80,
			"Grotesque Guardians": 31,
			"Hespori": 0.4,
			"Kalphite Queen": 30,
			"King Black Dragon": 70,
			"Kraken": 82,
			"Kree'Arra": 22,
			"K'ril Tsutsaroth": 26,
			"Mimic": 0.2,
			"Nex": 12,
			"Nightmare": 11,
			"Phosani's Nightmare": 6.5,
			"Obor": 3,
			"Phantom Muspah": 25,
			"Sarachnis": 56,
			"Scorpia": 60,
			"Skotizo": 0.8,
			"Spindel": 0,
			"Tempoross": 7,
			"The Gauntlet": 10,
			"The Corrupted Gauntlet": 6.5,
			"Theatre of Blood": 2.5,
			"Theatre of Blood: Hard Mode": 2.4,
			"Thermonuclear Smoke Devil": 80,
			"Tombs of Amascut": 2.5,
			"Tombs of Amascut: Expert Mode": 2.5,
			"TzKal-Zuk": 0.8,
			"TzTok-Jad": 2,
			"Venenatis": 35,
			"Vet'ion": 23,
			"Vorkath": 32,
			"Wintertodt": 8,
			"Zalcano": 15,
			"Zulrah": 32,
		}
		const minigameDifficulty = {
			"Bounty Hunter - Hunter": 0,
			"Bounty Hunter - Rogue": 0,
			"Clue Scrolls (all)": 0,
			"Clue Scrolls (beginner)": .08,
			"Clue Scrolls (easy)": .12,
			"Clue Scrolls (medium)": .2,
			"Clue Scrolls (hard)": .4,
			"Clue Scrolls (elite)": 1.2,
			"Clue Scrolls (master)": 2,
			"LMS - Rank": 0,
			"PvP Arena - Rank": 0,
			"Soul Wars Zeal": 0,
			"Rifts closed": 1,
			"Abyssal Sire": 2,
			"Alchemical Hydra": 2,
			"Artio": 0,
			"Barrows Chests": 1,
			"Bryophyta": 1,
			"Callisto": 2,
			"Calvar'ion": 0,
			"Cerberus": 1,
			"Chambers of Xeric": 2.8,
			"Chambers of Xeric: Challenge Mode": 3,
			"Chaos Elemental": 1,
			"Chaos Fanatic": 1,
			"Commander Zilyana": 2,
			"Corporeal Beast": 2,
			"Crazy Archaeologist": 1,
			"Dagannoth Prime": 1,
			"Dagannoth Rex": 1,
			"Dagannoth Supreme": 1,
			"Deranged Archaeologist": 1,
			"General Graardor": 2,
			"Giant Mole": 1,
			"Grotesque Guardians": 1,
			"Hespori": 1,
			"Kalphite Queen": 2,
			"King Black Dragon": 1,
			"Kraken": 1,
			"Kree'Arra": 2,
			"K'ril Tsutsaroth": 2,
			"Mimic": 3,
			"Nex": 2,
			"Nightmare": 2,
			"Phosani's Nightmare": 4,
			"Obor": 1,
			"Phantom Muspah": 2,
			"Sarachnis": 1,
			"Scorpia": 2,
			"Skotizo": 2,
			"Spindel": 0,
			"Tempoross": 1,
			"The Gauntlet": 1,
			"The Corrupted Gauntlet": 2,
			"Theatre of Blood": 3,
			"Theatre of Blood: Hard Mode": 5,
			"Thermonuclear Smoke Devil": 1,
			"Tombs of Amascut": 2,
			"Tombs of Amascut: Expert Mode": 3,
			"TzKal-Zuk": 10,
			"TzTok-Jad": 3,
			"Venenatis": 2,
			"Vet'ion": 2,
			"Vorkath": 2,
			"Wintertodt": 1,
			"Zalcano": 2,
			"Zulrah": 2,
		}
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
							playerSkillsData[skill] = Math.floor(xp / preMaxModifier[skill]);
						} else {
							playerSkillsData[skill] = Math.floor(13034431 / preMaxModifier[skill]) + Math.floor((xp - 13034431) / postMaxModifer[skill]);
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
                    if (minigameEHB.hasOwnProperty(minigameName) && !isNaN(kc) && kc * minigameDifficulty[minigameName] > 0) {
                        playerMinigameData[minigameName] = Math.floor((kc / minigameEHB[minigameName]) * minigameDifficulty[minigameName]);
                        minigamePoints += playerMinigameData[minigameName];
                    }
                }
                
                const totalPoints = skillPoints + minigamePoints;
				let iconID = "";
				if (totalPoints >= 0 && totalPoints <= 275) {
					iconID = "Sapphire";
				} else if (totalPoints >= 276 && totalPoints <= 700) {
					iconID = "Emerald";
				} else if (totalPoints >= 701 && totalPoints <= 1400) {
					iconID = "Ruby";
				} else if (totalPoints >= 1401 && totalPoints <= 2500) {
					iconID = "Diamond";
				} else if (totalPoints >= 2501 && totalPoints <= 4000) {
					iconID = "Dragonstone";
				} else if (totalPoints >= 4001 && totalPoints <= 6500) {
					iconID = "Onyx";
				} else if (totalPoints >= 6501 && totalPoints <= 9500) {
					iconID = "Zenyte";
				} else if (totalPoints >= 9501 && totalPoints <= 12000) {
					iconID = "Legend";
				} else if (totalPoints > 12000) {
					iconID = "Myth";
				}
                const emoji = interaction.guild.emojis.cache.find(emoji => emoji.name === iconID);
                
                let skillPointsOutput = Object.entries(playerSkillsData)
                    .map(([key, value]) => `${key} : ${value}\n`)
                    .join('');
              
                let minigameOutput = Object.entries(playerMinigameData)
                    .map(([key, value]) => `${key} : ${value}\n`)
                    .join('');

                let breakdownOutput = `---Points from Skills---\n${skillPointsOutput}Total Skill Points: ${skillPoints}\n\n---Points from Minigames & Bossing---\n${minigameOutput}Total Minigame & Bossing Points: ${minigamePoints}\n\nTotal Points: ${totalPoints}`;
                
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
