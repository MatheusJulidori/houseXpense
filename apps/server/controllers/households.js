const svc = require('../services/households.js');

/* GET */

exports.getHousehold = async (req, res, next) => {
    try {
        const hh = await svc.get(req.params.id);
        if (!hh) return res.sendStatus(404);
        res.json(hh);
    } catch (err) { next(err); }
};

exports.getAllHouseholds = async (_, res, next) => {
    try {
        const households = await svc.getAll();
        res.json(households);
    } catch (err) { next(err); }
};

exports.getHouseholdSummary = async (req, res, next) => {
  try {
    const dashboard = await svc.summary(req.params.id);
    if (!dashboard) return res.sendStatus(404);
    res.json(dashboard);
  } catch (err) { next(err); }
};

/* POST */

exports.createHousehold = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });
        if (!description) return res.status(400).json({ error: 'description required' });

        const hh = await svc.create({ name, description });
        res.json(hh);
    } catch (err) { next(err); }
};

/* PUT */

exports.updateHousehold = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });
        if (!description) return res.status(400).json({ error: 'description required' });

        const hh = await svc.update(id, { name, description });
        if (!hh) return res.sendStatus(404);
        res.json(hh);
    } catch (err) { next(err); }
};

/* DELETE */

exports.deleteHousehold = async (req, res, next) => {
    try {
        const { id } = req.params;
        const hh = await svc.delete(id);
        if (!hh) return res.sendStatus(404);
        res.json(hh);
    } catch (err) { next(err); }
};
