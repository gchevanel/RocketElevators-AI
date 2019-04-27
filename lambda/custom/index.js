/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require("ask-sdk-core");
const http = require("https");

// ----- the 2 next function are to change elevator status with id and status -----
const ChangeStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeStatusIntent"
    );
  },
  async handle(handlerInput) {
    const elevatorID =
      handlerInput.requestEnvelope.request.intent.slots.id.value;
    const status =
      handlerInput.requestEnvelope.request.intent.slots.status.value;
    var capitalizedStatus = uppercaseFirstCharacter(status);

    var result = await httpPutElevatorStatus(elevatorID, capitalizedStatus);

    let say = result;

    return handlerInput.responseBuilder
      .speak(say)
      .reprompt()
      .getResponse();
  }
};

async function httpPutElevatorStatus(elevatorID, capitalizedStatus) {
  return new Promise((resolve, reject) => {
    const putData = `{"id":"${elevatorID}","status":"${capitalizedStatus}"}`;
    console.log(elevatorID, capitalizedStatus);
    var options = {
      host: "rocketelevatorsgab.azurewebsites.net", // here is the end points
      path: `/api/elevator/${elevatorID}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(putData)
      },
      method: "PUT"
    };
    var req = http.request(options, res => {
      var responseString = "";
      res.on("data", chunk => {
        responseString = responseString + chunk;
      });
      res.on("end", () => {
        console.log("Received: " + responseString);
        resolve(responseString);
      });
      res.on("error", e => {
        console.log("ERROR: " + e);
        reject();
      });
    });
    req.write(putData);
    req.end();
  });
}

// here is the greating message hello there. how can i help you today
const GetLaunchHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Hello there. How can i help you today?";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt()
      .getResponse();
  }
};

// ----- here is to find the elevator status of a elevator specific-----
const GetStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetStatusIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }

    const elevatorStatus = await getRemoteElevatorData(
      "https://rocketelevatorsgab.azurewebsites.net/api/elevator/" + id
    );

    const elevator = JSON.parse(elevatorStatus).status;

    outputSpeech = `The status of elevator ${id} is ${elevator} `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};
// ----- here is where we make all get for the big sentence -----

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetRemoteDataIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";

    const elevatorData = await getRemoteElevatorData(
      "https://rocketelevatorsgab.azurewebsites.net/api/elevator/"
    );
    const elevatorAllData = await getRemoteElevatorAllData(
      "https://rocketelevatorsgab.azurewebsites.net/api/elevator/all"
    );
    const buildingData = await getRemoteBuildingData(
      "https://rocketelevatorsgab.azurewebsites.net/api/building/"
    );
    const customerData = await getRemoteCustomerData(
      "https://rocketelevatorsgab.azurewebsites.net/api/customer/"
    );
    const batteryData = await getRemoteBatteryData(
      "https://rocketelevatorsgab.azurewebsites.net/api/battery/"
    );
    const AddressCityData = await getRemoteCityData(
      "https://rocketelevatorsgab.azurewebsites.net/api/address/"
    );
    const QuoteData = await getQuoteData(
      "https://rocketelevatorsgab.azurewebsites.net/api/quote/quote"
    );
    const LeadData = await getLeadData(
      "https://rocketelevatorsgab.azurewebsites.net/api/lead"
    );
    const elevator = JSON.parse(elevatorData);
    const elevatorAll = JSON.parse(elevatorAllData);
    const building = JSON.parse(buildingData);
    const customer = JSON.parse(customerData);
    const batteries = JSON.parse(batteryData);
    const cities = JSON.parse(AddressCityData);
    const quotes = JSON.parse(QuoteData);
    const leads = JSON.parse(LeadData);
    // const customer = JSON.parse(c);

    outputSpeech = `Hi Sir welcome to Rocket Elevator Statistic. There are currently ${
      elevatorAll.length
    } elevators deployed in the ${building.length} buildings of your ${
      customer.length
    } customers . Currently, ${
      elevator.length
    } elevators are not in Running Status and are being serviced.
    ${batteries.length} Battreries are deployed across ${
      cities.length
    } cities. On another note you currently have ${
      quotes.length
    } quotes awaiting processing. You also have ${
      leads.length
    } leads in your contact requests



    `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// ----- here is where i get the elevator serial number -----

const GetElevatorSnHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetElevatorSnIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }

    const elevatorAllData = await getRemoteElevatorAllData(
      "https://rocketelevatorsgab.azurewebsites.net/api/elevator/" + id
    );

    const elevatorserial = JSON.parse(elevatorAllData).serial_number;

    outputSpeech = `the serial number of elevator ${id} is ${elevatorserial}`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// ----- here is where i get the elevator information -----

const GetElevatorInformationHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetElevatorInformationIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }

    const elevatorAllData = await getRemoteElevatorAllData(
      "https://rocketelevatorsgab.azurewebsites.net/api/elevator/" + id
    );

    const elevatorserial = JSON.parse(elevatorAllData).serial_number;
    const elevatorstatus = JSON.parse(elevatorAllData).status;
    const elevatorclass = JSON.parse(elevatorAllData).elevator_class;
    const elevatortype = JSON.parse(elevatorAllData).elevator_type;

    outputSpeech = `the elevator ${id} status is ${elevatorstatus} with serial number ${elevatorserial}
    . The elevator class is ${elevatorclass} with the type of ${elevatortype}`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};
// ----- here is for the help commands -----

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "Here is the list of all commands : what is the status of elevator {id},Can you tell me the status of elevator {id}, change elevator {id} status to {status}, change status to {status} for elevator {id}, how rocket elevators is going, what happen at rocket elevators, what is going on, what is the serial number of elevator {id}, what is the SN of elevator {id}, can you tell me the serial number of elevator {id}, give me some information about elevator {id}, what happen with the elevator {id}, can you tell me some information about elevator {id}";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};
const getLeadData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getRemoteElevatorData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getRemoteElevatorAllData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getQuoteData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getRemoteBuildingData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getRemoteCityData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getRemoteCustomerData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
const getRemoteBatteryData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetLaunchHandler,
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    ChangeStatusHandler,
    GetElevatorSnHandler,
    GetElevatorInformationHandler,
    GetStatusHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
function uppercaseFirstCharacter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
