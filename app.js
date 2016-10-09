var STRIPE_PK = 'pk_test_IR0lZ3Ot5IQnsde6xuAmkHvB';
var tonicURL = "https://tonicdev.io/thor-stripe/stripe-non-card-payments-demo/branches/master/sources/";

// Helpers
var ChromeSamples = {
  log: function() {
    var line = Array.prototype.slice.call(arguments).map(function(argument) {
      return typeof argument === 'string' ? argument : JSON.stringify(argument);
    }).join(' ');

    document.querySelector('#log').textContent += line + '\n';
  },

  clearLog: function() {
    document.querySelector('#log').textContent = '';
  },

  setStatus: function(status) {
    document.querySelector('#status').textContent = status;
  },

  setContent: function(newContent) {
    var content = document.querySelector('#content');
    while(content.hasChildNodes()) {
      content.removeChild(content.lastChild);
    }
    content.appendChild(newContent);
  }
};

// Check if payment request API is supported
var buyButton = document.getElementById('buyButton');
if ('PaymentRequest' in window) {
  buyButton.setAttribute('style', 'display: inline;');
  buyButton.addEventListener('click', onBuyClicked);
} else {
  buyButton.setAttribute('style', 'display: none;');
  ChromeSamples.setStatus('This browser does not support web payments. Please try on mobile Chrome.');
}

/**
* Invokes PaymentRequest for credit cards.
*/
var details = {
  total: {label: 'Donation', amount: {currency: 'EUR', value: '55.00'}},
  displayItems: [
    {
      label: 'Original donation amount',
      amount: {currency: 'EUR', value: '65.00'}
    },
    {
      label: 'Friends and family discount',
      amount: {currency: 'EUR', value: '-10.00'}
    }
  ]
};
var paymentRequestObj;

function onBuyClicked() {
  var supportedInstruments = [{
    supportedMethods: ['visa', 'mastercard','amex']
  }];

  new PaymentRequest(supportedInstruments, details) // eslint-disable-line no-undef
  .show()
  .then(function(instrumentResponse) {
    paymentRequestObj = instrumentResponse;
    sendPaymentToServer(instrumentResponse);
  })
  .catch(function(err) {
    ChromeSamples.setStatus(err);
  });
}

function sendPaymentToServer(instrumentResponse) {
  var paymentDetails = instrumentResponse.details;
  // Tokenize with Stripe.js
  Stripe.setPublishableKey(STRIPE_PK);
  Stripe.card.createToken({
    number: paymentDetails.cardNumber,
    cvc: paymentDetails.cardSecurityCode,
    exp_month: paymentDetails.expiryMonth,
    exp_year: paymentDetails.expiryYear,
    address_zip: paymentDetails.billingAddress.postalCode,
    address_line1: paymentDetails.billingAddress.addressLine[0],
    address_line2: paymentDetails.billingAddress.addressLine[1],
    address_city: paymentDetails.billingAddress.city,
    address_state: paymentDetails.billingAddress.region,
    address_country: paymentDetails.billingAddress.country,
    name: paymentDetails.cardholderName
  }, stripeResponseHandler);
}

function stripeResponseHandler(status, response) {
  var myData = {
    token: response.id,
    currency: details.total.amount.currency,
    amount: Math.round(parseInt(details.total.amount.value) * 100),
    description: details.total.label
  };

  /*
  Make an AJAX post request using JQuery,
  change the first parameter to your charge script
  */
  $.post("https://runkit.io/thor-stripe/stripe-plain-charge-server/branches/master"
  ,myData,
  function(data) {
  paymentRequestObj.complete('success')
  .then(function() {
    ChromeSamples.log(JSON.stringify(data));
  })
  .catch(function(err) {
    ChromeSamples.setStatus(err);
  });
  }).fail(function() {
    // if things fail, tell us
    ChromeSamples.setStatus("I'm sorry something went wrong");
  })
}
