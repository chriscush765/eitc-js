const xapi = require('xapi');

const PanelID = 'record';

var recording = false;

var webex = false;

function onGuiEvent(event) {
  //if not the record button clicked
  if(event.PanelId !== PanelID) return;
  
  xapi.command("UserInterface Extensions Panel Close");
  
  //if not webex meeting
  if(!webex){
    xapi.command("UserInterface Message Alert Display", {Title: "Notice", Text: "Recording is avaiable only in Webex calls", Duration: 5});
    return;
  }

  if(recording){
      console.log("stop");
    xapi.command("Call DTMFSend", {DTMFString: "#9"});
    recording = false;
  }
  else{
      console.log("start");
    xapi.command("Call DTMFSend", {DTMFString: "*9"});
     console.log("sent");
    recording = true;
  }
}

function onCallEvent(event) {
  if(event.RemoteURI.endsWith('.webex.com')){
    console.log('webex meeting!')
    webex = true;
  }
  else{
    console.log('non webex meeting!')
    webex = false;
  }
}

xapi.event.on('UserInterface Extensions Panel Clicked', onGuiEvent);

xapi.event.on('CallSuccessful', onCallEvent);