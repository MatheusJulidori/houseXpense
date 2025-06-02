const svc = require('../services/people.js');

/* GET */
exports.getPerson = async (req, res, next) => {
  try {
    const p = await svc.get(req.params.id);
    if (!p) return res.sendStatus(404);
    res.json(p);
  } catch (err) { next(err); }
};


exports.getAllPeople = async (req, res, next) => {
  try { res.json(await svc.getAll(req.query.householdId)); }
  catch (err) { next(err); }
};

exports.listPeopleForHouseholdDashboard = async (req, res, next) => {
  try {
    const { householdId } = req.query;
    if (!householdId) return res.status(400).json({ error: 'householdId required' });
    res.json(await svc.listForHouseholdDashboard(householdId));
  } catch (err) { next(err); }
};

/* POST */
exports.createPerson = async (req, res, next) => {
  try {
    const { householdId, name, salary } = req.body;
    if (!householdId || !name || salary == null)
      return res.status(400).json({ error: 'householdId, name, salary required' });

    res.json(await svc.create({ householdId, name, salary }));
  } catch (err) { next(err); }
};

/* PUT / PATCH */
exports.updatePerson = async (req, res, next) => {
  try {
    const person = await svc.update(req.params.id, req.body);
    if (!person) return res.sendStatus(404);
    res.json(person);
  } catch (err) { next(err); }
};

/* DELETE */
exports.deletePerson = async (req, res, next) => {
  try {
    const person = await svc.delete(req.params.id, {
      settle: req.query.settle === 'true'
    });
    if (!person) return res.sendStatus(404);
    res.json(person);
  } catch (err) { next(err); }
};
