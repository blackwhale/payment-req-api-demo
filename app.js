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
function onBuyClicked() {
  var supportedInstruments = [{
    supportedMethods: ['visa', 'mastercard','amex']
  }];

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

  new PaymentRequest(supportedInstruments, details) // eslint-disable-line no-undef
      .show()
      .then(function(instrumentResponse) {
        sendPaymentToServer(instrumentResponse);
      })
      .catch(function(err) {
        ChromeSamples.setStatus(err);
      });
}

function sendPaymentToServer(instrumentResponse) {
  // There's no server-side component of these samples. Not transactions are
  // processed and no money exchanged hands. Instantaneous transactions are not
  // realistic. Add a 2 second delay to make it seem more real.
  window.setTimeout(function() {
    instrumentResponse.complete('success')
        .then(function() {
          ChromeSamples.log(instrumentResponse.details);
        })
        .catch(function(err) {
          ChromeSamples.setStatus(err);
        });
  }, 2000);
}
