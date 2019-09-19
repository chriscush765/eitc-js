const xapi = require('xapi');




const DIALPAD_ID = 'webexdialpad';
const DIALHOSTPIN_ID = 'webexhostpin';

const INROOMCONTROL_WEBEXCONTROL_PANELID = 'webexdialler';

/* Use these to check that its a valid number (depending on what you want to allow users to call */
const REGEXP_URLDIALER = /([a-zA-Z0-9@_\-\.]+)/; /*  . Use this one if you want to allow URL dialling */


const DIALPREFIX_AUDIO_GATEWAY = '0';
const DIALPOSTFIX_WEBEXURL = '@rutgers.webex.com';

var webexnumbertodial = '';
var hostpin = '';
var isInWebexCall = 0;

function showDialPad(text){
  xapi.command("UserInterface Message TextInput Display", {
               InputType: "Numeric"
             , Placeholder: '9 digit meeting number or address'
             , Title: "Rutgers Webex"
             , Text: text
             , SubmitText: "Next" 
             , FeedbackId: DIALPAD_ID
         }).catch((error) => { console.error(error); });
}

/* This is the listener for the in-room control panel button that will trigger the dial panel to appear */
xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
    if(event.PanelId === INROOMCONTROL_WEBEXCONTROL_PANELID){
         xapi.command("UserInterface Extensions Panel Close");
         showDialPad("Please enter a meeting number or address");
    }
});



xapi.event.on('UserInterface Message TextInput Response', (event) => {
    switch(event.FeedbackId){
        case DIALPAD_ID:
            let regex =REGEXP_URLDIALER; // First check, is it a valid number to dial
            let match = regex.exec(event.Text);    
            if (match !== null) {
                let contains_at_regex = /@/;    
                let contains_at_in_dialstring = contains_at_regex.exec(event.Text);
                if (contains_at_in_dialstring !== null) {
                    webexnumbertodial = match[1];
                }
                else{
                    webexnumbertodial = match[1];
                    webexnumbertodial = webexnumbertodial + DIALPOSTFIX_WEBEXURL ; // Here we add the default hostname to the SIP number 
                }

  
                 xapi.command("UserInterface Message TextInput Display", {
                       InputType: "Pin"
                     , Placeholder: "host PIN" 
                     , Title: "Host PIN"
                     , Text: 'Enter your host PIN. If you are not the meeting host, press Dial'
                     , SubmitText: "Dial" 
                     , FeedbackId: DIALHOSTPIN_ID
                 }).catch((error) => { console.error(error); });                

                   
            }
            else{
                showDialPad(`"${event.Text}" is not a valid meeting number.`);
            }
            break;

        case DIALHOSTPIN_ID:
            hostpin = event.Text;
            xapi.command("dial", {Number: webexnumbertodial}).catch((error) => { console.error(error); });
            break;
    }
});


xapi.status.on('Call RemoteNumber', (remoteNumber) => {
	if(remoteNumber.includes('webex.com')){
	    isInWebexCall = 1;
    	}
});
    
    
xapi.status.on('Call Status', (status) => {
  console.log(status)
  if(status == "Connected"){
    if(isInWebexCall){ 
      if(hostpin.length>0){
        xapi.command("Call DTMFSend", {DTMFString: hostpin});  
          if(!hostpin.includes('#')){
              xapi.command("Call DTMFSend", {DTMFString: '#'});
                  }
        } 
      
    }
  else if(status == "Disconnecting"){
    isInWebexCall = 0;
  }
}

xapi.status.on("Standby State", (state) => { // when the device goes in or out of standby
   xapi.command("UserInterface Extensions Panel Close");
  });
});
