const skillList = ["Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecraft", "Hunter", "Construction"];
const minigameList = ["Bounty Hunter - Hunter", "Bounty Hunter - Rogue", "Bounty Hunter (Legacy) - Hunter", "Bounty Hunter (Legacy) - Rogue", "Clue Points (all)", "Clue Scrolls (beginner)", "Clue Scrolls (easy)", "Clue Scrolls (medium)", "Clue Scrolls (hard)", "Clue Scrolls (elite)", "Clue Scrolls (master)", "LMS - Rank", "PvP Arena - Rank", "Soul Wars Zeal", "Rifts closed", "Abyssal Sire", "Alchemical Hydra", "Artio", "Barrows Chests", "Bryophyta", "Callisto", "Calvar'ion", "Cerberus", "Chambers of Xeric", "Chambers of Xeric: Challenge Mode", "Chaos Elemental", "Chaos Fanatic", "Commander Zilyana", "Corporeal Beast", "Crazy Archaeologist", "Dagannoth Prime", "Dagannoth Rex", "Dagannoth Supreme", "Deranged Archaeologist", "General Graardor", "Giant Mole", "Grotesque Guardians", "Hespori", "Kalphite Queen", "King Black Dragon", "Kraken", "Kree'Arra", "K'ril Tsutsaroth", "Mimic", "Nex", "Nightmare", "Phosani's Nightmare", "Obor", "Phantom Muspah", "Sarachnis", "Scorpia", "Skotizo", "Spindel", "Tempoross", "The Gauntlet", "The Corrupted Gauntlet", "Theatre of Blood", "Theatre of Blood: Hard Mode", "Thermonuclear Smoke Devil", "Tombs of Amascut", "Tombs of Amascut: Expert Mode", "TzKal-Zuk", "TzTok-Jad", "Venenatis", "Vet'ion", "Vorkath", "Wintertodt", "Zalcano", "Zulrah"];

//PRE-99 - Experience needed for 1 point
const preMaxSkillValue = {
    "Attack": 100000,
    "Defence": 100000,
    "Strength": 100000,
    "Hitpoints": 100000,
    "Ranged": 100000,
    "Prayer": 35000,
    "Magic": 100000,
    "Cooking": 100000,
    "Woodcutting": 50000,
    "Fletching": 100000,
    "Fishing": 50000,
    "Firemaking": 100000,
    "Crafting": 35000,
    "Smithing": 50000,
    "Mining": 30000,
    "Herblore": 25000,
    "Agility": 30000,
    "Thieving": 100000,
    "Slayer": 30000,
    "Farming": 50000,
    "Runecraft": 30000,
    "Hunter": 50000,
    "Construction": 50000
};

//POST-99 - Experience needed for 1 point
const postMaxSkillValue = {
    "Attack": 300000,
    "Defence": 300000,
    "Strength": 300000,
    "Hitpoints": 300000,
    "Ranged": 300000,
    "Prayer": 105000,
    "Magic": 300000,
    "Cooking": 300000,
    "Woodcutting": 150000,
    "Fletching": 300000,
    "Fishing": 100000,
    "Firemaking": 300000,
    "Crafting": 105000,
    "Smithing": 150000,
    "Mining": 90000,
    "Herblore": 75000,
    "Agility": 90000,
    "Thieving": 300000,
    "Slayer": 90000,
    "Farming": 150000,
    "Runecraft": 90000,
    "Hunter": 150000,
    "Construction": 150000
};	

//Boss & Minigame KC needed for 1 point
const bossPointValue = {
    "Bounty Hunter - Hunter": 0,
    "Bounty Hunter - Rogue": 0,
    "Bounty Hunter (Legacy) - Hunter": 0,
    "Bounty Hunter (Legacy) - Rogue": 0,
    "Clue Scrolls (all)": 0,
    "Clue Scrolls (beginner)": 10,
    "Clue Scrolls (easy)": 5,
    "Clue Scrolls (medium)": 3.33333,
    "Clue Scrolls (hard)": 2,
    "Clue Scrolls (elite)": 1,
    "Clue Scrolls (master)": 0.5,
    "LMS - Rank": 0,
    "PvP Arena - Rank": 0,
    "Soul Wars Zeal": 0,
    "Rifts closed": 7,
    "Abyssal Sire": 10,
    "Alchemical Hydra": 8,
    "Artio": 15,
    "Barrows Chests": 15,
    "Bryophyta": 3,
    "Callisto": 15,
    "Calvar'ion": 15,
    "Cerberus": 10,
    "Chambers of Xeric": 0.8,
    "Chambers of Xeric: Challenge Mode": 0.4,
    "Chaos Elemental": 15,
    "Chaos Fanatic": 30,
    "Commander Zilyana": 8,
    "Corporeal Beast": 3,
    "Crazy Archaeologist": 40,
    "Dagannoth Prime": 35,
    "Dagannoth Rex": 60,
    "Dagannoth Supreme": 35,
    "Deranged Archaeologist": 50,
    "General Graardor": 8,
    "Giant Mole": 50,
    "Grotesque Guardians": 15,
    "Hespori": 0.8,
    "Kalphite Queen": 15,
    "King Black Dragon": 25,
    "Kraken": 35,
    "Kree'Arra": 8,
    "K'ril Tsutsaroth": 8,
    "Mimic": 0.2,
    "Nex": 6,
    "Nightmare": 5,
    "Phosani's Nightmare": 2,
    "Obor": 3,
    "Phantom Muspah": 8,
    "Sarachnis": 40,
    "Scorpia": 15,
    "Skotizo": 0.6,
    "Spindel": 20,
    "Tempoross": 7,
    "The Gauntlet": 10,
    "The Corrupted Gauntlet": 2.5,
    "Theatre of Blood": 0.4,
    "Theatre of Blood: Hard Mode": 0.25,
    "Thermonuclear Smoke Devil": 20,
    "Tombs of Amascut": 1,
    "Tombs of Amascut: Expert Mode": 0.5,
    "TzKal-Zuk": 0.1,
    "TzTok-Jad": 1,
    "Venenatis": 15,
    "Vet'ion": 15,
    "Vorkath": 12,
    "Wintertodt": 10,
    "Zalcano": 5,
    "Zulrah": 12
};

function getClanEmoji(totalPoints) {
    let iconID = "";
    if (totalPoints >= 13000) {
        iconID = "Myth";
    } else if (totalPoints >= 9000) {
        iconID = "Legend";
    } else if (totalPoints >= 5000) {
        iconID = "Templar";
    } else if (totalPoints >= 3000) {
        iconID = "Dragon";
    } else if (totalPoints >= 1500) {
        iconID = "Rune";
    } else if (totalPoints >= 700) {
        iconID = "Adamant";
    } else {
        iconID = "Mithril";
    }
    return iconID;
}

module.exports = {skillList, preMaxSkillValue, postMaxSkillValue, minigameList, bossPointValue, getClanEmoji}