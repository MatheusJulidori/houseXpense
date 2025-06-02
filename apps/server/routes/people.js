const express = require('express');
const c = require('../controllers/people.js');

const r = express.Router();

r.post('/', c.createPerson);
r.get('/dashboard', c.listPeopleForHouseholdDashboard);
r.get('/', c.getAllPeople);
r.get('/:id', c.getPerson);
r.put('/:id', c.updatePerson);
r.delete('/:id', c.deletePerson);

module.exports = r;
