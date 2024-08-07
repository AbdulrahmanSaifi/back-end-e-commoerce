const { validationResult } = require('express-validator');

const validate = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        errors.array().map((err) => (error[err.param] = err.msg));
        return res.status(422).json({ error });
    }
};

module.exports = { validate };
