//Written by: Monib Baray
//Last Updated: 9/11/2020, 5:10pm


const playerData = require('./data/players.json');
const heroData = require('./data/heroes.json');
const request = require('request');

function resultOfMatch(result) 
{
    if (result == true) {
        return 'Radiant';
    } else {
        return 'Dire';
    }
}

exports.resultOfMatch = resultOfMatch;

function resultOfLastMatch(result, playerslot) 
{
    if (((playerslot >> 7) & 1) === 0) {
        // Radiant 
        if (resultOfMatch(result) == 'Radiant') {
            return 'Won';
        } else {
            return 'Lost';
        }
    } else {
        // Dire
        if (resultOfMatch(result) == 'Dire') {
            return 'Won';
        } else {
            return 'Lost';
        }
    }
}

exports.resultOfLastMatch = resultOfLastMatch;

function playerLookup(id) 
{
    for (var name in playerData) {
        if (name.toString() == id) {
            return playerData[name].id;
        }
    }

    return id;
}

exports.playerLookup = playerLookup;

function findRankTier(rank_tier) 
{
    let rank = String(rank_tier);
    let result = '';

    if (rank_tier == 'null') {
        return 'unknown';
    }

    if (rank.charAt(0) == '1') {
        result += 'Herald';
    } else if (rank.charAt(0) == '2') {
        result += 'Guardian';
    } else if (rank.charAt(0) == '3') {
        result += 'Crusader';
    } else if (rank.charAt(0) == '4') {
        result += 'Archon';
    } else if (rank.charAt(0) == '5') {
        result += 'Legend';
    } else if (rank.charAt(0) == '6') {
        result += 'Ancient';
    } else if (rank.charAt(0) == '7') {
        result += 'Divine';
    } else if (rank.charAt(0) == '8') {
        result += 'Immortal';
    } else {
        result += 'Unknown';
    }

    for (i = 0; i < 6; ++i) {
        if (rank.charAt(1) == i) {
            result += ' ';
            result += i;
        }
    }

    return result;
}

exports.findRankTier = findRankTier;

function findGameMode(game_mode) 
{
    if (game_mode == 1) {
        return 'All Pick';
    } else if (game_mode == 22) {
        return 'Ranked All Pick'; 
    } else if (game_mode == 3) {
        return 'Random Draft';
    } else if (game_mode == 4) {
        return 'Single Draft (Low prio)';
    } else if (game_mode == 5) {
        return 'All Random';
    } else if (game_mode == 7) {
        return 'Diretide';
    } else if (game_mode == 8) {
        return 'Reverse Captains Mode';
    } else if (game_mode == 9) {
        return 'Greeviling';
    } else if (game_mode == 10) {
        return 'Tutorial';
    } else if (game_mode == 11) {
        return 'Mid Only';
    } else if (game_mode == 12) {
        return 'Least Played';
    } else if (game_mode == 13) {
        return 'New Player Pool';
    } else if (game_mode == 14) {
        return 'Compendium Matchmaking';
    } else if (game_mode == 15) {
        return 'Custom';
    } else if (game_mode == 16) {
        return 'Captains Draft';
    } else if (game_mode == 17) {
        return 'Balanced Draft';
    } else if (game_mode == 18) {
        return 'Ability Draft';
    } else if (game_mode == 20) {
        return 'All Random Deathmatch';
    } else if (game_mode == 21) {
        return 'Solo Mid 1v1';
    } else if (game_mode == 2) {
        return 'Captains Mode';
    } else if (game_mode == 24) {
        return 'Mutation';
    } else if (game_mode == 23) {
        return 'Turbo';
    } else {
	    return 'Unknown';    
    }
}

exports.findGameMode = findGameMode;

function playerKDA(data)
{
    var kills = 1;
    var deaths;
    var assists;
    var kda = '';
    deaths = data[1].sum/data[0].sum;
    deaths = Math.round((deaths + Number.EPSILON) * 100) / 100;
    assists = data[2].sum/data[0].sum;
    assists = Math.round((assists + Number.EPSILON) * 100) / 100;
    kda += kills + ".00" + '/' + deaths + '/' + assists

    return kda;
}
exports.playerKDA = playerKDA;

function heroLookup(heroID) 
{
    //id -> string (i.e. 1 -> antimage)
    if (Number.isInteger(parseInt(heroID))) {
        for (var i = 0; i < heroData.length; i++)
        {
            if (heroData[i].id.toString() == heroID) {
                return heroData[i].localized_name;
            }
        }
    }
    //string -> id (i.e. antimage -> 1)
    else {
        for (var i = 0; i < heroData.length; i++)
        {
            if(heroData[i].name == heroID) {
                return heroData[i].id;
            }
        }
    }
    return 'Hero ID not found';
}
exports.heroLookup = heroLookup;

function winRate(data, heroID)
{
    var result = data[0].win / data[0].games;
    result = result * 100;
    result = Math.round((result + Number.EPSILON) * 100) / 100;
    return result + '% out of ' + data[0].games + ' games';
}
exports.winRate = winRate;

function getLosses(games, wins)
{
    var result = games - wins;
    return result;
}
exports.getLosses = getLosses;