//Written By: Monib Baray
//Last Updated: 3/15/2020
//Version 1.3

//import all dependencies
const Discord = require('discord.js')
const {prefix ,token} = require('./config.json');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');
const querystring = require('querystring');
const heroData = require('./data/heroes.json');
const helperMethods = require('./helper.js');
const request = require('request');

const client = new Discord.Client();
const queue = new Map();

//this makes sure that the embed doesnt error when the field value is over 1024 characters
const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

//A variable to quickly get codeblockformatting for a message
var codeBlockFormatting = '```' ;
codeBlockFormatting = codeBlockFormatting.replace(/\"([^(\")"]+)\":/g,"$1:");


//Basic listeners that output to console its status
client.once('ready', () => {console.log('Ready!');});
client.once('reconnecting', () => {console.log('Reconnecting');});
client.once('disconnect', () => {console.log('Disconnect!');});




//Reading command inputs and re-directing to the appropriate function
client.on('message', async message => {
    client.user.setActivity('!help for details', {type: 'PLAYING' });
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);
    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}help`)) {
        help(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}bad`)) {
        bad(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}leave`)) {
        leave(message, serverQueue);
        return;
    }
    else if (message.content.startsWith(`${prefix}soundbytes`)) {
        soundbytes(message, serverQueue);
    }
    else if (message.content.startsWith(`${prefix}scream`)) {
        scream(message, serverQueue);
    }
    else if (message.content.startsWith(`${prefix}baby`)) {
        baby(message, serverQueue);
    }
    else if (message.content.startsWith(`${prefix}urban`)) {
    	urbandictionary(message);
    }
    else if (message.content.startsWith(`${prefix}userinfo`)) {
    	userinfo(message);
    }
    else
    {
        message.channel.send("Enter a valid command (!help for details)") ;
    }
});

//this is meant as a helper function that eventually calls play
async function execute(message, serverQueue)
{
    try
    {
        const args = message.content.split(" ");
        const voiceChannel = message.member.voice.channel;
            if (!voiceChannel)
            return message.channel.send("You need to be in a voice channel to play music!");
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {return message.channel.send("I need PERMISSIONS");}


        const songInfo = await ytdl.getInfo(args[1]);
        const song = {title: songInfo.videoDetails.title, id: songInfo.videoDetails.videoId};


        if (!serverQueue)
        {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };

            queue.set(message.guild.id, queueConstruct);

            queueConstruct.songs.push(song);

            try 
            {
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(message.guild, queueConstruct.songs[0]);
            }
            catch (err) 
            {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        }
        else
        {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} has been added to the queue!`);
        }
    }
    catch(err)
    {
        console.log(err);
    }
} //end execute

//intendented functionality: skip the song and go to the next in queue *or* leave the channel if there is no song to skip
async function skip(message, serverQueue)
{
    if(!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to stop the music");
    if (!serverQueue)
        return message.channel.send("There is no song to skip") ;
    serverQueue.connection.dispatcher.end() ;
} //end skip

//sends a tutorial message in the specificed text channel
async function help(message, serverQueue) {
	const args = message.content.split(" ");

    if (args.length == 2) {
    	if (args[1] == 'userinfo') {
    		return message.channel.send(
    			"Usage for this command is as follows: **!userinfo *ID*** where ID is either a name in the database or a valid numerical ID" +
    			`\nThis command will give you a 'player card' of sorts of the specified ID, including:`+
    			codeBlockFormatting +
    			`\n>Player Avatar` +
    			`\n>Player Username` +
    			`\n>Last Known MMR` +
    			`\n>Total Wins and Losses` +
    			`\n>Total KDA (in K/D/A ratio format)` +
    			`\n>Most played hero in ranked (with that hero's winrate and total games played)` +
    			codeBlockFormatting
    			);
    	}
    }
    else {
	    return message.channel.send(
	            "This bot is made by Monib#2525, and is intended as an all purpose bot with music functionality, soundbytes, and dota-related commands!" +
	            codeBlockFormatting +
	            `\n!play {youtube url}: The bot will join your current voice channel and play *youtube url*` +
	            `\n!skip: This will skip the current song and move to the next song in queue (if there are no more songs, the bot will leave)` +
	            `\n!leave: This will cause the bot to leave the voice channel` +
	            `\n!urban QUERY: This will define QUERY (a phrase) via a query from urban dictionary` +
	            `\n!soundbytes: This will list all possible sound bytes the bot can play` +
	            `\n!userinfo ID: This will give you a general information rundown on ID's dota profile` +
	            codeBlockFormatting +
	            `\nIf you want to request an audiobyte, please @ Monib and he'll get on it right away!` +
	            `\nAdditionally, if you want more specific help on a command, type !help *command* <:monibW:513647461898911744> /`
        	)
	}
} //end help

//lists all soundbytes currently available 
async function soundbytes(message, serverQueue)
{
    return message.channel.send(
            "The following soundbytes are currently available:" +
            `\n**!bad**: This will play the soundbyte from *Recess* where Vince says "and when i say bad, I mean actually bad"` +
            `\n**!scream**: This will play sanfords infamous frustrated scream` +
            `\n**!baby**: This will play Lawson's baby piglet impression`
        )
} //end help

function play(guild, song) 
{
        const prefix = "https://www.youtube.com/watch?v="
        const serverQueue = queue.get(guild.id) ;
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(prefix + song.id))
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 8);
        serverQueue.textChannel.send(`Start playing: **${song.title}**`);

} //end play

async function bad(message, serverQueue)
{
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to play audio bytes");
    if(!serverQueue)
    {
        var voiceChannel = message.member.voice.channel;
        voiceChannel.join().then(connection => 
        {
            const dispatcher = connection.play('./Audio/bad.mp3');
            dispatcher.on('finish', () => 
            {
                connection.disconnect();
            });
        }).catch(err => console.log(err));
    }
} //end bad

async function scream(message, serverQueue)
{
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to play audio bytes");
    var voiceChannel = message.member.voice.channel;
    voiceChannel.join().then(connection => 
    {
        const dispatcher = connection.play('./Audio/frustration.wav');
        dispatcher.on('finish', () => 
        {
            connection.disconnect();
        });
    }).catch(err => console.log(err));
    
} //end scream

async function baby(message, serverQueue)
{
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to play audio bytes");
    var voiceChannel = message.member.voice.channel;
    voiceChannel.join().then(connection => 
    {
        const dispatcher = connection.play('./Audio/baby.mp3');
        dispatcher.on('finish', () => 
        {
            connection.disconnect();
        });
    }).catch(err => console.log(err));
    
} //end scream

async function leave(message, serverQueue)
{
    if (!message.member.voice.channel)
        return message.channel.send("You have to be in a voice channel to make me leave");

    message.member.voice.channel.leave();
    return message.channel.send("Goodbye.");
} //end leave

//Queries the urban dictionary API to send an embeded message in the specified chat channel 
async function urbandictionary(message)
{
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'urban') {
    	if (!args.length) {
    		return message.channel.send('You need to supply a search term!');
    	}
    	const query = querystring.stringify({ term: args.join(' ') });

    	const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());
    	if (!list.length) {
    		return message.channel.send(`No results found for **${args.join(' ')}**.`);
    	}
    	const [answer] = list;
    	const embed = new Discord.MessageEmbed()
    		.setColor('#334FFF')
    		.setTitle(answer.word)
    		.setURL(answer.permalink)
    		.addFields(
    				{ name: 'Definition', value: trim(answer.definition, 1024) },
    				{ name: 'Example', value: trim(answer.example, 1024) },
    				{ name: 'Rating', value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.` },
    			);

    	message.channel.send(embed);
    }
}
async function userinfo(message)
{
	const args = message.content.split(" ");
	var matches = args[1].match(/\d+/g);
	
	if (args.length < 2) {
		return message.channel.send('Not a valid command');
	}

	//This determine whether playerID is a numerical argument or a string; if its a string, make it lowercase (because thats how it is in file) 
	if (!matches) {
		args[1] = args[1].toLowerCase()
	}

	//These are applicable for all cases, so they will be declared here
	let id = helperMethods.playerLookup(args[1]);
	let requestUrl = "http://api.opendota.com/api/players/";
	let url = requestUrl.concat(id);

	//the first case where the user just wants general info on a player with PLAYERID (i.e. the command is !userinfo PLAYERID)
	if (args.length === 2) {
		request(url, function (error, response, body) {
	        let generalData = JSON.parse(body);
	        if (generalData.error == 'Internal Server Error' || typeof generalData.profile == 'undefined') {
	            message.channel.send('Error, invalid ID or name');
	        } 
	        else {
	        	let winLossUrl = url.concat('/wl');
	        	request(winLossUrl, function(error2, response2, body2) {
	        		let winLossData = JSON.parse(body2);
	        		let kdaUrl = "https://api.opendota.com/api/players/" + id + "/totals";
	        		request(kdaUrl, function(error3, response3, body3) {
	        			let kdaData = JSON.parse(body3);
		        		let heroDataUrl = "https://api.opendota.com/api/players/" + id + "/heroes?lobby_type=7";
		        		request(heroDataUrl, function(error4, response4, body4) {
		        			let heroData = JSON.parse(body4);
		        			let heroID = helperMethods.heroLookup(heroData[0].hero_id) ;
		        			const embed = new Discord.MessageEmbed()
				                .setColor('#334FFF')
				                .setTitle(generalData.profile.personaname)
				                .setThumbnail(generalData.profile.avatarmedium)
				                .setURL(`https://opendota.com/players/${id}`)
				                .addFields(
				                			{ name: 'Rank', value: (helperMethods.findRankTier(generalData.rank_tier)) },
				                			{ name: 'MMR', value: generalData.solo_competitive_rank },
				                			{ name: 'Wins', value: winLossData.win},
				                			{ name: 'Losses', value: winLossData.lose},
				                			{ name: 'KDA', value: (helperMethods.playerKDA(kdaData)) },
				                			{ name: 'Most played hero (Ranked)', value: (helperMethods.heroLookup(heroData[0].hero_id)) + '; Winrate = ' + (helperMethods.winRate(heroData))}
				                		);
			            		message.channel.send(embed);
		        		}) //end heroData request
	        		}) //end kdaData request
	        	}) //end the winLossData request 
	        } //end else
	    })//end the general data request 
	} //end the 2 arguments case

	//This case is for specific information being requested about a user's hero data or lane data (i.e. !userdata monib mid/ !userdata monib invoker)
	//Additionally, this will include all stats (i.e. not limited by ranked/unranked/game mode)
	else if (args.length == 3) {
		
		//case if the 3rd argument is a hero name
		//First need to convert user input into a normalized string that can be checked through heroes.json
		args[2] = args[2].toLowerCase();
		//Put abbreviations to regular name code here (i.e. am -> antimage)
		//Put nicknames to regular name code here (i.e. magina -> antimage)
		let heroID = helperMethods.heroLookup(args[2]);
		if (Number.isInteger(heroID)) {
			//entering if statement
			let heroDataUrl = "https://api.opendota.com/api/players/" + id + "/heroes";
			request(heroDataUrl, function(error, response, body) {
				let heroData = JSON.parse(body);
				for (var i = 0; i < heroData.length; i++)
				{
					if (heroData[i].hero_id == heroID.toString()) {
						message.channel.send(
							codeBlockFormatting + "\nHero: " + args[2] + "\nWins: " + heroData[i].win + "\nLosses: " + helperMethods.getLosses(heroData[i].games, heroData[i].win) + codeBlockFormatting);
					}
					else {
						message.channel.send("Invalid hero name");
					}
				} //end for loop
			}) //end general info for heroID request

			//specific info for heroID request
			heroDataUrl = "https://api.opendota.com/api/players/" + id + "/totals?hero_id=" + heroID;
			request(heroDataUrl, function(error, response, body) {
				let heroData = JSON.parse(body);
				message.channel.send(
					codeBlockFormatting +
					"Kills/Deaths/Assists:" + helperMethods.playerKDA(heroData) +
					"\nNumber of throws: " + heroData[24].n +
					"\nNumber of comebacks: " + heroData[25].n +
					"\nNumber of stomps: " + heroData[26].n + codeBlockFormatting);
			}) //end specific info for heroID request
		} //end if
		//heroID is null meaning the requested info was a lane
		else {
			var lane;
			if (args[2] == "safelane" || args[2] == "1" || args[2] == "carry") {
				lane = 1;
			}
			else if (args[2] == "mid" || args[2] == "2") {
				lane = 2;
			}
			else if (args[2] == "offlane" || args[2] == "3") {
				lane = 3;
			}
			else if (args[2] == "roamer" || args[2] == "4" || args[2] == "softsupport") {
				lane = 4;
			}
			else if (args[2] == "hardsupport" || args[2] == "5") {
				lane = 5; 
			}
			else {
				message.channel.send("Invalid lane/position");
			}
			let laneDataUrl = "https://api.opendota.com/api/players/" + id + "/wl?lane_role=" + lane;
			request(laneDataUrl, function(error, response, body) {
				let laneData = JSON.parse(body);
				message.channel.send(
					codeBlockFormatting + "Position " + lane + "\nWins: " + laneData.win + "\nLosses: " + laneData.lose + codeBlockFormatting)
			}) //end request laneData
		} //end else statement
	} //end 3 arguments case

	//This case is for further specific information being requested about a user (i.e. !userinfo monib invoker mid/ !userinfo monib invoker support/ !userinfo monib mid ranked)
	else {

	} //end 4+ arguments case
} //end userinfo
async function matchinfo (message)
{
	const args = message.content.split(" ");
	var matches = args[1].match(/\d+/g);

	let id = helperMethods.playerLookup(args[1]);
	let requestUrl = "http://api.opendota.com/api/matches/";
	let url = requestUrl.concat(id);

	if (args.length != 3) {
		return message.channel.send('When using this command, you need to supply a matchID and the information you want.') ;
	}
	if (!matches && (args[1].length != 9)) {
		return message.channel.send('Not a valid match ID');
	}

} //end matchinfo
	

client.login(token);
