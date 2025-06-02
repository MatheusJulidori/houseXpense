const svc = require('../services/settlements.js');

/* GET */
exports.getSettlement = async (req, res, next) => {
  try {
    const st = await svc.get(req.params.id);
    if (!st) return res.sendStatus(404);
    res.json(st);
  } catch (err) { next(err); }
};

exports.getAllSettlements = async (req, res, next) => {
  try {
    const { householdId, personId } = req.query;
    res.json(await svc.getAll({ householdId, personId }));
  } catch (err) { next(err); }
};

/* POST */
exports.createSettlement = async (req, res, next) => {
  try {
    res.json(await svc.create(req.body));
  } catch (err) { next(err); }
};

/* DELETE */
exports.deleteSettlement = async (req, res, next) => {
  try {
    const st = await svc.delete(req.params.id);
    if (!st) return res.sendStatus(404);
    res.json(st);
  } catch (err) { next(err); }
};
