//Init
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

//Bot init
client.once('ready', () =>{
    console.log('Bot up and running.');
    client.user.setActivity("with Mei");
});

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
                message.author.send("Thank you for registering for the ATDL SEA in-house league! \nYou can now join the STANDARD FACEIT hub using the link below: \n" + config.faceitinvite + "\nDM the admins for access to the higher ranked queue.");
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
        

    }
});

//Login
client.login(process.env.BOT_TOKEN);

