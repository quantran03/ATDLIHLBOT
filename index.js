const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');


client.once('ready', () =>{
    console.log('Bot up and running.');
});

client.on('message', message => {
    
    if(message.channel.name == config.ihlchannel){
        if (message.content.startsWith("ATDL:")){
            let ihlRole = message.guild.roles.find(role => role.name === config.ihlrole);
            message.member.addRole(ihlRole).catch(console.error);
            console.log("Verified member " + message.author)
        }
    }

    if(message.content.startsWith(config.prefix)){
        console.log("Command detected");

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
});

client.login(config.token);

