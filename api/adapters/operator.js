const { constant } = require('change-case')
const { create, events } = require('@egendata/client')
const { setTransactionName, startSpan } = require('./apm.js')
const keyValueStore = require('../services/keyValueStore')

// Configure and create
const config = {
  displayName: 'My CV',
  description: 'An app for your CV online',
  iconURI: 'http://localhost:4000/android-icon-96x96.png',
  clientId: process.env.CLIENT_ID || 'http://localhost:4000',
  operator: process.env.OPERATOR_URL || 'http://localhost:3000',
  jwksPath: '/jwks',
  eventsPath: '/events',
  clientKey: process.env.PRIVATE_KEY,
  defaultPermissions: [
    {
      area: 'baseData',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'Personal information.'
    },
    {
      area: 'experience',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'A list of your work experiences.'
    },
    {
      area: 'education',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'A list of your educations.'
    },
    {
      area: 'languages',
      types: ['READ', 'WRITE'],
      purpose: 'In order to create a CV using our website.',
      description: 'A list of your language proficiencies.'
    }
  ],
  keyValueStore: keyValueStore
}
const client = create(config)

// Add event listeners for instrumentation
const {
  emitter,

  CONNECT_TO_OPERATOR_START,
  CONNECT_TO_OPERATOR,
  CONNECT_TO_OPERATOR_ERROR,

  DATA_READ_START,
  DATA_READ,
  DATA_READ_ERROR,

  DATA_WRITE_START,
  DATA_WRITE,
  DATA_WRITE_ERROR,

  ENCRYPT_START,
  ENCRYPT,
  ENCRYPT_ERROR,

  DECRYPT_START,
  DECRYPT,
  DECRYPT_ERROR,

  GENERATE_KEY_START,
  GENERATE_KEY,
  GENERATE_KEY_ERROR,

  MESSAGE_RECIEVE_START,
  MESSAGE_RECIEVE,
  MESSAGE_RECIEVE_ERROR,

  SIGN_START,
  SIGN,
  SIGN_ERROR,

  VERIFY_START,
  VERIFY,
  VERIFY_ERROR
} = events

function span (start, end, error, type = 'custom') {
  emitter.on(start, () => {
    const span = startSpan(end, type)
    const endSpan = () => {
      span.end()
      emitter.removeListener(end, endSpan)
      emitter.removeListener(error, endSpan)
    }
    emitter.on(end, endSpan)
    emitter.on(error, endSpan)
  })
}

emitter.on(CONNECT_TO_OPERATOR, ({ type }) => setTransactionName(constant(CONNECT_TO_OPERATOR)))
emitter.on(MESSAGE_RECIEVE, ({ type }) => setTransactionName(type))

span(CONNECT_TO_OPERATOR_START, CONNECT_TO_OPERATOR, CONNECT_TO_OPERATOR_ERROR)
span(DATA_READ_START, DATA_READ, DATA_READ_ERROR)
span(DATA_WRITE_START, DATA_WRITE, DATA_WRITE_ERROR)
span(MESSAGE_RECIEVE_START, MESSAGE_RECIEVE, MESSAGE_RECIEVE_ERROR)
span(ENCRYPT_START, ENCRYPT, ENCRYPT_ERROR, 'crypto')
span(DECRYPT_START, DECRYPT, DECRYPT_ERROR, 'crypto')
span(GENERATE_KEY_START, GENERATE_KEY, GENERATE_KEY_ERROR, 'crypto')
span(SIGN_START, SIGN, SIGN_ERROR, 'crypto')
span(VERIFY_START, VERIFY, VERIFY_ERROR, 'crypto')

module.exports = client
