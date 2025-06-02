const express = require('express');
const c = require('../controllers/settlements.js');

const r = express.Router();

r.post('/', c.createSettlement);
r.get('/', c.getAllSettlements);
r.get('/:id', c.getSettlement);
r.delete('/:id', c.deleteSettlement);

module.exports = r;
