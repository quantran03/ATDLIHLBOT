//Init
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const config = require('./config.json');
var obj;

let userReactionList = []; //Array to store users for reaction command

// Bot init
client.once('ready', () =>{
    console.log('Bot up and running.');
    client.user.setActivity("with Mei");
});

var request = require("request");

// FACEIT API call function
function getFACEITData(callbackFunction, offsetVar, limitVar, typeVar){
    var options = { method: 'GET',
    url: 'https://open.faceit.com/data/v4/hubs/fe4b3380-e4f5-48eb-9abd-10ed8cce99f8/matches',
    qs: { offset: offsetVar, limit: limitVar, type: typeVar},
    headers: 
    { 'cache-control': 'no-cache',
        Connection: 'keep-alive',
        Cookie: '__cfduid=de2b9c4d9b26ef900df41854df809612b1572953596',
        'Accept-Encoding': 'deflate',
        Host: 'open.faceit.com',
        'Postman-Token': '6b5b1a57-16cf-410c-93d4-7d103b23bb27,f92da73e-6515-4327-88d4-a9a3e9601ce6',
        'Cache-Control': 'no-cache',
        'User-Agent': 'PostmanRuntime/7.19.0',
        Authorization: 'Bearer 4817bd38-4afb-4c66-b8bf-eb80c077ee5e',
        Accept: 'application/json' } };

		
    request(options, function (error, response, body) {
    		// getting data from API
      
        if (error) throw new Error(error);
        obj = JSON.parse(body);
        //console.log(obj);
        callbackFunction(obj);
	
    });
      
    }

// Date format function
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var offset = date.getTimezoneOffset();
  var offsetHours = offset / 60;
  hours = hours + offsetHours + config.timezone; // Manipulating time so that it shows the right time zone.
  var ampm = hours % 24 >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  month = date.getMonth() + 1;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getDate() + "/" + month  + "/" + date.getFullYear() + "  " + strTime;
}

 //Reaction check-in for ATDL Blitz House Members
        
//Upon reaction removal
client.on('messageReactionRemove', async (reaction, user) => {
    // When we receive a reaction we check if the reaction is partial or not. Reactions are partial if they are from messages posted before the bot is started
    if (reaction.partial){

        try{
            await reaction.fetch();
        }
        catch(error){
            console.log('Unable to fetch: ', error);
            return;
        }
    }

    // 3 tests: 1- Emoji must be WhiteCheckMark; 2- Message should be House Check-in; 3- The user must already be present in the list
    let messageContent = reaction.message.content

    if (reaction.emoji.name === '✅' && messageContent.toLowerCase().startsWith(config.reactioncheckprefix) && userReactionList.includes(user)){
        // Splice works based on array index so first the index of this user is found and then just the user is spliced
        userReactionList.splice(userReactionList.indexOf(user));
        //Logging for debug
        console.log("User unreacted & removed from list");
    }

});

// When a message reaction is added, user and reaction data is given to the function below.
client.on('messageReactionAdd', async (reaction, user) => {
    // When we receive a reaction we check if the reaction is partial or not. Reactions are partial if they are from messages posted before the bot is started
    if (reaction.partial){

        try{
            await reaction.fetch();
        }
        catch(error){
            console.log('Unable to fetch: ', error);
            return;
        }

    }
    let currentmember = reaction.message.guild.member(user);

      // If the user already exists in the array, this should not proceed to avoid duplicates. The message tested must include house check-in and the emoji must be the white check mark emoji
    if((!userReactionList.includes(user)) && reaction.message.content.startsWith(config.reactioncheckprefix) && reaction.emoji.name === '✅' ) {
        // user data is added to the array defined at the beginning of this file
        userReactionList.push(user);
        // log is for debugging purposes
        console.log('User reacted and added to list');
        //console.log(userReactionList);
    }

});


// On message receive
client.on('message', message => {
    
    // IHL registration
    if(message.channel.name == config.ihlchannel){

        // Verifying correct format
        if (message.content.startsWith("ATDL:")){
            let ihlBannedRole = message.guild.roles.find(role => role.name === config.ihlbannedrole);

            // Checking for no ban
            if(message.member.roles.has(ihlBannedRole.id)) {
                message.author.send("Sorry, you can not participate in the ATDL SEA in-house league as of now because you are banned.")
            } else {
                
                // DMing info and giving role
                let ihlRole = message.guild.roles.find(role => role.name === config.ihlrole);
                message.member.addRole(ihlRole).catch(console.error);
                console.log("Verified member " + message.author);
                // long as fuck line
                message.author.send("Thank you for registering for the ATDL SEA in-house league!\n--\nYou can now join the **standard** Faceit hub using the link below. This standard queue will be available to all players of all skill levels.\n" + config.faceitinvite + "\n--\nIf you are below divine and would like access to the sub divine queue, DM the admins for the invite link.");
            }
            
        }
    }

    if(message.content.startsWith(config.prefix)){
        console.log("Command detected");

        let ihlAdminRole = message.guild.roles.find(role => role.name === config.ihladminrole);
        let modRole = message.guild.roles.find(role => role.name === config.modrole);
        let adminRole = message.guild.roles.find(role => role.name === config.adminrole);

        // Checking IHL Admin role
        if(message.member.roles.has(ihlAdminRole.id)){
            
            // Open and close queue command
            if (message.content === config.prefix + "open"){
                console.log("Open q")
                message.channel.bulkDelete(2);
                message.channel.send("", {
                file: "https://i.imgur.com/SLtHKQj.png"
                });
            }

            if (message.content === config.prefix + "close"){
                console.log("Close q")
                message.channel.bulkDelete(2);
                message.channel.send("", {
                file: "https://i.imgur.com/n3QAEOQ.png"
                });
            }
            
            
            
        }

        //Only mods and admins can execute this command
        if(message.member.roles.has(adminRole.id) || message.member.roles.has(modRole.id)){

            if (message.content === config.prefix + "reactionlist"){
            //Ensures error isn't thrown if list is empty
                console.log(userReactionList);
                console.log(userReactionList.length);
                //message.channel.send(userReactionList);
                if(userReactionList.length > 0){
                    //Outputting user objects
                    message.channel.send(userReactionList);
                } else{
                    message.channel.send("No users found in reaction list.");
                }
            }

            if(message.content === config.prefix + "clearreactionlist") {
                // Empties list
                userReactionList = [];
                // Debugging and Confirmation
                message.channel.send('Reaction List Cleared');
            }
        }
       
        //FACEIT Recent match comand
        if (message.content === config.prefix + "recentmatch"){
                // Call FACEIT API
                getFACEITData(function(data){
                    
                    // Getting and formatting date
                    
                    var gameStartTime = new Date(data.items[0].configured_at * 1000); //configured_at instead os started_at because game may be cancelled.
                    var gameStartString = formatDate(gameStartTime);

                    // Construct Embed from API data
                    var embedMsg = new Discord.RichEmbed()
                    .setColor('#4287f5')
                    .setTitle('Most recent IHL Match')
                    .setAuthor('ATDL IHL BOT', 'https://i.imgur.com/FCNHTgV.png')
                    .setDescription('Below is a summary of the most recent match of the ATDL in-house league.')
                    .addField('Status', data.items[0].status)
                    .addField('Time started', gameStartString);

                    // If match is already finished, display winner
                    if (data.items[0].status === "FINISHED"){
                        if (data.items[0].results.winner === "faction1"){
                            // If team 1 wins
                            embedMsg.addField(data.items[0].teams.faction1.name + " [WINNER]", `${data.items[0].teams.faction1.roster[0].nickname}\n${data.items[0].teams.faction1.roster[1].nickname}\n${data.items[0].teams.faction1.roster[2].nickname}\n${data.items[0].teams.faction1.roster[3].nickname}\n${data.items[0].teams.faction1.roster[4].nickname}`, true);
                            embedMsg.addField(data.items[0].teams.faction2.name, `${data.items[0].teams.faction2.roster[0].nickname}\n${data.items[0].teams.faction2.roster[1].nickname}\n${data.items[0].teams.faction2.roster[2].nickname}\n${data.items[0].teams.faction2.roster[3].nickname}\n${data.items[0].teams.faction2.roster[4].nickname}`, true);
                        } else if(data.items[0].results.winner === "faction2"){
                            // If team 2 wins
                            embedMsg.addField(data.items[0].teams.faction1.name, `${data.items[0].teams.faction1.roster[0].nickname}\n${data.items[0].teams.faction1.roster[1].nickname}\n${data.items[0].teams.faction1.roster[2].nickname}\n${data.items[0].teams.faction1.roster[3].nickname}\n${data.items[0].teams.faction1.roster[4].nickname}`, true);
                            embedMsg.addField(data.items[0].teams.faction2.name + " [WINNER]", `${data.items[0].teams.faction2.roster[0].nickname}\n${data.items[0].teams.faction2.roster[1].nickname}\n${data.items[0].teams.faction2.roster[2].nickname}\n${data.items[0].teams.faction2.roster[3].nickname}\n${data.items[0].teams.faction2.roster[4].nickname}`, true);
                        }
                    } else{
                        // If game is cancelled or in progress
                        embedMsg.addField(data.items[0].teams.faction1.name, `${data.items[0].teams.faction1.roster[0].nickname}\n${data.items[0].teams.faction1.roster[1].nickname}\n${data.items[0].teams.faction1.roster[2].nickname}\n${data.items[0].teams.faction1.roster[3].nickname}\n${data.items[0].teams.faction1.roster[4].nickname}`, true);
                        embedMsg.addField(data.items[0].teams.faction2.name, `${data.items[0].teams.faction2.roster[0].nickname}\n${data.items[0].teams.faction2.roster[1].nickname}\n${data.items[0].teams.faction2.roster[2].nickname}\n${data.items[0].teams.faction2.roster[3].nickname}\n${data.items[0].teams.faction2.roster[4].nickname}`, true);
                    }
                    
                    embedMsg.setTimestamp()
                    .setFooter('Made by LOLEnigMatic');
                    
                    message.channel.send(embedMsg);
 					
				}, 0, 1, "all");
            }

    }
});


// Login

client.login(process.env.BOT_TOKEN);

