const Alexa = require('ask-sdk-core')
const axios = require('axios')

function getEvent(city, day) {
  // Only getting events in the US right now
  var date1 = `${day}` + 'T14:00:00';
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&localStartDateTime=${date1},${date1}&apikey=${process.env.API_KEY}`

  return axios.get(url).then(function (response) {
    return response.data._embedded.events[0].name
  })
}

const EventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'EventIntent'
  },
  handle(handlerInput) {
    const city = handlerInput.requestEnvelope.request.intent.slots.city.value;
    const day = handlerInput.requestEnvelope.request.intent.slots.day.value;

    return getEvent(city, day).then(function (name) {
      const speechText = `The events happening in ${city} on ${day} are <emphasis>${name}</emphasis>`

      return handlerInput.responseBuilder
        .speak(speechText)
        .getReponse()
    })
  }
}

const ErrorHandler = {
    canHandle() {
        return true
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("I'm sorry, I don't think there's any events happening that day. Would you like to search for a different date or city?")
            .reprompt("Sorry, I didn't quite catch that. Can you please repeat that for me?")
            .withShouldEndSession(false)
            .getReponse()
    },
}

const builder = Alexa.SkillBuilders.custom()

exports.handler = builder
  .addRequestHandlers(EventIntentHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda()