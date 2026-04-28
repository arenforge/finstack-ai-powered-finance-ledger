const { randomUUID } = require('crypto');

const store = {
  transactions: [],
  goals: [],
  bills: [],
  sharedBudgets: []
};

function useMemoryStore() {
  return process.env.DEV_DATA_MEMORY === 'true';
}

function makeItem(payload) {
  return {
    _id: randomUUID(),
    createdAt: new Date(),
    ...payload
  };
}

module.exports = { store, useMemoryStore, makeItem };
