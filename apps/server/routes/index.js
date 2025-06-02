const express = require('express');

const householdsRouter = require('./households.js');
const peopleRouter = require('./people.js');
const expensesRouter = require('./expenses.js');
const settlementsRouter = require('./settlements.js');

const r = express.Router();

r.use('/households', householdsRouter);
r.use('/people', peopleRouter);
r.use('/expenses', expensesRouter);
r.use('/settlements', settlementsRouter);

module.exports = r;
