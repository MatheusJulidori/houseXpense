const svc = require('../services/expenses.js');

/* GET */
exports.getExpense = async (req, res, next) => {
  try {
    const exp = await svc.get(req.params.id);
    if (!exp) return res.sendStatus(404);
    res.json(exp);
  } catch (err) { next(err); }
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    res.json(await svc.getAll(req.query.householdId));
  } catch (err) { next(err); }
};

/* POST */
exports.createExpense = async (req, res, next) => {
  try {
    res.json(await svc.create(req.body));
  } catch (err) { next(err); }
};

/* PUT / PATCH */
exports.updateExpense = async (req, res, next) => {
  try {
    const exp = await svc.update(req.params.id, req.body);
    if (!exp) return res.sendStatus(404);
    res.json(exp);
  } catch (err) { next(err); }
};

/* DELETE */
exports.deleteExpense = async (req, res, next) => {
  try {
    const exp = await svc.delete(req.params.id);
    if (!exp) return res.sendStatus(404);
    res.json(exp);
  } catch (err) { next(err); }
};
