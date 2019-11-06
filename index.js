//Init
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
var obj;
//Bot init
client.once('ready', () =>{
    console.log('Bot up and running.');
    client.user.setActivity("with Mei");
});

var request = require("request");

//FACEIT API call function
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
    		//getting data from API
      
        if (error) throw new Error(error);
        obj = JSON.parse(body);
        //console.log(obj);
        callbackFunction(obj);
	
    });
      
    }

//Date format function
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  month = date.getMonth() + 1;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getDate() + "/" + month  + "/" + date.getFullYear() + "  " + strTime;
}


//On message receive
client.on('message', message => {
    
    //IHL registration
    if(message.channel.name == config.ihlchannel){

        //Verifying correct format
        if (message.content.startsWith("ATDL:")){
            let ihlBannedRole = message.guild.roles.find(role => role.name === config.ihlbannedrole);

            //Checking for no ban
            if(message.member.roles.has(ihlBannedRole.id)) {
                message.author.send("Sorry, you can not participate in the ATDL SEA in-house league as of now because you are banned.")
            } else {
                
                //DMing info and giving role
                let ihlRole = message.guild.roles.find(role => role.name === config.ihlrole);
                message.member.addRole(ihlRole).catch(console.error);
                console.log("Verified member " + message.author);
                //long as fuck line
                message.author.send("Thank you for registering for the ATDL SEA in-house league!\n--\nYou can now join the **standard** Faceit hub using the link below. This standard queue will be available to all players of all skill levels.\n" + config.faceitinvite + "\n--\nIf you are below divine and would like access to the sub divine queue, DM the admins for the invite link.");
            }
            
        }
    }

    if(message.content.startsWith(config.prefix)){
        console.log("Command detected");

        let adminRole = message.guild.roles.find(role => role.name === config.adminrole);

        //Checking IHL Admin role
        if(message.member.roles.has(adminRole.id)){
            
            //Open and close queue command
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
        
        if (message.content === config.prefix + "recentmatch"){
                //Call FACEIT API
                getFACEITData(function(data){
                    
                    //Getting and formatting date
                    
                    var gameStartTime = new Date(data.items[0].configured_at * 1000); //configured_at instead os started_at because game may be cancelled.
                    var gameStartString = formatDate(gameStartTime);

                    //Construct Embed from API data
                    var embedMsg = new Discord.RichEmbed()
                    .setColor('#4287f5')
                    .setTitle('Most recent IHL Match')
                    .setAuthor('ATDL IHL BOT', 'https://i.imgur.com/FCNHTgV.png')
                    .setDescription('Below is a summary of the most recent match of the ATDL in-house league.')
                    .addField('Status', data.items[0].status)
                    .addField('Time started', gameStartString)
                    .addField(data.items[0].teams.faction1.name, `${data.items[0].teams.faction1.roster[0].nickname}\n${data.items[0].teams.faction1.roster[1].nickname}\n${data.items[0].teams.faction1.roster[2].nickname}\n${data.items[0].teams.faction1.roster[3].nickname}\n${data.items[0].teams.faction1.roster[4].nickname}`, true)
                    .addField(data.items[0].teams.faction2.name, `${data.items[0].teams.faction2.roster[0].nickname}\n${data.items[0].teams.faction2.roster[1].nickname}\n${data.items[0].teams.faction2.roster[2].nickname}\n${data.items[0].teams.faction2.roster[3].nickname}\n${data.items[0].teams.faction2.roster[4].nickname}`, true)
                    .setTimestamp()
                    .setFooter('Made by LOLEnigMatic');
                    
                    message.channel.send(embedMsg);
 					
				}, 0, 1, "all");
            }

    }
});

/*
getFACEITData(function(data){
    console.log(data);
    console.log(data.items[0].status);
    console.log(data.items[0].started_at);
})
*/
//console.log (getFACEITData());
//Login
//client.login("MzY1ODUwOTMyNTczMTEwMjc1.XcFvpA.7HQOkG9aq4peEi6DmRnLGh6c_kA");
client.login(process.env.BOT_TOKEN);

