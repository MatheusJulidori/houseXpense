const express = require('express');
const c = require('../controllers/expenses.js');

const r = express.Router();

r.post('/', c.createExpense);
r.get('/', c.getAllExpenses);
r.get('/:id', c.getExpense);
r.put('/:id', c.updateExpense);
r.delete('/:id', c.deleteExpense);

module.exports = r;
