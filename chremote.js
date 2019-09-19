/*

        CCCCCCCCCCCCChhhhhhh             RRRRRRRRRRRRRRRRR                                                                         tttt                              
     CCC::::::::::::Ch:::::h             R::::::::::::::::R                                                                     ttt:::t                              
   CC:::::::::::::::Ch:::::h             R::::::RRRRRR:::::R                                                                    t:::::t                              
  C:::::CCCCCCCC::::Ch:::::h             RR:::::R     R:::::R                                                                   t:::::t                              
 C:::::C       CCCCCC h::::h hhhhh         R::::R     R:::::R    eeeeeeeeeeee       mmmmmmm    mmmmmmm      ooooooooooo   ttttttt:::::ttttttt        eeeeeeeeeeee    
C:::::C               h::::hh:::::hhh      R::::R     R:::::R  ee::::::::::::ee   mm:::::::m  m:::::::mm  oo:::::::::::oo t:::::::::::::::::t      ee::::::::::::ee  
C:::::C               h::::::::::::::hh    R::::RRRRRR:::::R  e::::::eeeee:::::eem::::::::::mm::::::::::mo:::::::::::::::ot:::::::::::::::::t     e::::::eeeee:::::ee
C:::::C               h:::::::hhh::::::h   R:::::::::::::RR  e::::::e     e:::::em::::::::::::::::::::::mo:::::ooooo:::::otttttt:::::::tttttt    e::::::e     e:::::e
C:::::C               h::::::h   h::::::h  R::::RRRRRR:::::R e:::::::eeeee::::::em:::::mmm::::::mmm:::::mo::::o     o::::o      t:::::t          e:::::::eeeee::::::e
C:::::C               h:::::h     h:::::h  R::::R     R:::::Re:::::::::::::::::e m::::m   m::::m   m::::mo::::o     o::::o      t:::::t          e:::::::::::::::::e 
C:::::C               h:::::h     h:::::h  R::::R     R:::::Re::::::eeeeeeeeeee  m::::m   m::::m   m::::mo::::o     o::::o      t:::::t          e::::::eeeeeeeeeee  
 C:::::C       CCCCCC h:::::h     h:::::h  R::::R     R:::::Re:::::::e           m::::m   m::::m   m::::mo::::o     o::::o      t:::::t    tttttte:::::::e           
  C:::::CCCCCCCC::::C h:::::h     h:::::hRR:::::R     R:::::Re::::::::e          m::::m   m::::m   m::::mo:::::ooooo:::::o      t::::::tttt:::::te::::::::e          
   CC:::::::::::::::C h:::::h     h:::::hR::::::R     R:::::R e::::::::eeeeeeee  m::::m   m::::m   m::::mo:::::::::::::::o      tt::::::::::::::t e::::::::eeeeeeee  
     CCC::::::::::::C h:::::h     h:::::hR::::::R     R:::::R  ee:::::::::::::e  m::::m   m::::m   m::::m oo:::::::::::oo         tt:::::::::::tt  ee:::::::::::::e  
        CCCCCCCCCCCCC hhhhhhh     hhhhhhhRRRRRRRR     RRRRRRR    eeeeeeeeeeeeee  mmmmmm   mmmmmm   mmmmmm   ooooooooooo             ttttttttttt      eeeeeeeeeeeeee  



"It's like Chris... and remote"


   ______  ______  ____  ___  _________   _  ________
  /  _/  |/  / _ \/ __ \/ _ \/_  __/ _ | / |/ /_  __/
 _/ // /|_/ / ___/ /_/ / , _/ / / / __ |/    / / /   
/___/_/  /_/_/   \____/_/|_| /_/ /_/ |_/_/|_/ /_/    
ChRemote requires a couple of things in order to run...


First, set Mode: ON under HttpClient in the Codec settings.
Then, under Video Input, find the correct port and set...
InputSourceType = camera
  Name = "RU TV" or whatever you want
  Quality = "Motion"
  Visiblity = "Never"


Then, finally, make sure the Cable Tuner is set to 1080P under the A/V settings pags




Variables:


IP for Cable Tuner. Must be in format" "x.x.x.x"                        */

const tunerIP = "172.23.192.229";

// Port that cable tuner is plugged into
const tunerPort = 3;

const turningOnText = "Cable Tuner is turning on...";
const turningOffText = "Cable Tuner is turning off...";
const OnText = "Cable Tuner is on";
const OffText = "Cable Tuner is off";

const panelID = "tv-remote"






//begin actual code here!
const xapi = require("xapi");
var tunerStatus = null; //will update this next
var lastClickedPanel = null;

//when the script first starts, figure out if the tuner is on or not.
xapi.status
    .get(`Video Input Source ${tunerPort} FormatStatus`)
    .then(FormatStatus => {
        if (FormatStatus == "Ok")
            //if there is video input
            tunerStatus = "on";
        //no video input
        else tunerStatus = "off";
    });

//sends a code to the tuner, the codes are predetermined, I found them by analyzing the tv tuner web control post requests to cmd.pst
function sendCode(code) {
    xapi.command(
        "HttpClient Post",
        {
            Url: "http://" + tunerIP + "/cmd.pst"
        },
        code
    );
}

//updates the line of text above the power button
function updateStatus(message) {
    xapi.command("UserInterface Extensions Widget SetValue", {
        Value: message,
        WidgetId: "tuner_status"
    });
}

//called when a macro button is pressed
function guiEvent(event) {
  console.log(lastClickedPanel);
    if(lastClickedPanel !== panelID)
      return;
      
    console.log(event);
    
    if (event.WidgetId === "channel_up" && event.Type === "released")
        sendCode("KK22");

    if (event.WidgetId === "channel_down" && event.Type === "released")
        sendCode("KK23");

    //power on button
    if (event.WidgetId === "power" && event.Type === "released") {
        sendCode("KK9");
        if (tunerStatus == "on") {
            xapi.command(
                "UserInterface Presentation ExternalSource State Set",
                {
                    SourceIdentifier: "tv",
                    State: "Hidden"
                }
            );
            updateStatus(turningOffText);
        } else if (tunerStatus == "turningon") {
            updateStatus(OffText);
            tunerStatus = "off";
        } else {
            updateStatus(turningOnText);
            tunerStatus = "turningon";
        }
    }

    //number pad

    if (event.WidgetId === "chrbutton_1" && event.Type === "released")
        sendCode("KK11");
    else if (event.WidgetId === "button_2" && event.Type === "released")
        sendCode("KK12");
    else if (event.WidgetId === "button_3" && event.Type === "released")
        sendCode("KK13");
    else if (event.WidgetId === "button_4" && event.Type === "released")
        sendCode("KK14");
    else if (event.WidgetId === "button_5" && event.Type === "released")
        sendCode("KK15");
    else if (event.WidgetId === "button_6" && event.Type === "released")
        sendCode("KK16");
    else if (event.WidgetId === "button_7" && event.Type === "released")
        sendCode("KK17");
    else if (event.WidgetId === "button_8" && event.Type === "released")
        sendCode("KK18");
    else if (event.WidgetId === "button_9" && event.Type === "released")
        sendCode("KK19");
    else if (event.WidgetId === "button_0" && event.Type === "released")
        sendCode("KK10");
    else if (event.WidgetId === "button_0" && event.Type === "released")
        sendCode("KK10");
    else if (event.WidgetId === "button_dash" && event.Type === "released")
        sendCode("KK99");
    else if (event.WidgetId === "button_go" && event.Type === "released")
        sendCode("KK21");
    else if (event.WidgetId === "cc_mode" && event.Type === "released")
        sendCode("KK115");
}

//called when the codec goes into standby mode
function standbyEvent(event) {
    xapi.status
        .get(`Video Input Source ${tunerPort} FormatStatus`)
        .then(FormatStatus => {
            if (FormatStatus != "NotFound") {
                //if there is video input (if the tuner is on)
                sendCode("KK9"); //power off the unit
                tunerStatus = "off"; //update status
            }
        });
}

//called when either a video signal on the specified port becomes active or not
function videoInputEvent(response) {
    console.log(response);
    if (response == "Ok") {
        //if the tuner just turned on
        // in order to get the "RU TV" button in the share panel to actually do something, we need to remove our custom source and re add it every time the tuner is started
        //skipping these next two lines results in the share panel button for the ru tv not actually doing anything
        xapi.command("UserInterface Presentation ExternalSource Remove", {
            SourceIdentifier: "tv"
        }); //removes the custom external source
        xapi.command("UserInterface Presentation ExternalSource Add", {
            ConnectorId: tunerPort,
            SourceIdentifier: "tv",
            Name: "RU TV",
            Type: "camera"
        }); //adds the external source back
        xapi.command("UserInterface Presentation ExternalSource State Set", {
            SourceIdentifier: "tv",
            State: "Ready"
        }); //enables the button in the share panel
        tunerStatus = "on";
        updateStatus(OnText);
    } else {
        //if the tuner just turned on
        updateStatus(OffText);
        //hide the share icon just incase the tuner gets power cut.
        xapi.command("UserInterface Presentation ExternalSource State Set", {
            SourceIdentifier: "tv",
            State: "Hidden"
        });
        tunerStatus = "off";
    }
}

// event listeners
xapi.event.on("UserInterface Extensions Widget Action", guiEvent); //when a widget button is pressed
xapi.status.on("Standby State", standbyEvent); // when the device goes in or out of standby
xapi.status.on(`Video Input Source ${tunerPort} FormatStatus`, videoInputEvent); // when a video input chages on the specified port

xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
  lastClickedPanel = event.PanelId;
});
