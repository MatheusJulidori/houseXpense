const express = require('express');
const c = require('../controllers/households.js');

const r = express.Router();

r.post('/', c.createHousehold);
r.get('/summary/:id', c.getHouseholdSummary);
r.get('/', c.getAllHouseholds);
r.get('/:id', c.getHousehold);
r.put('/:id', c.updateHousehold);
r.delete('/:id', c.deleteHousehold);

module.exports = r;
