const db = require("../models");
const User = db.User;
// const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    const user = await User.findOne({ where: { account } });
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({ id: user.id }, 'secret-key', {
      expiresIn: '1h',
    });

    res.status(200).json({ token });

  } catch (err) {
    res.status(404).send({ err });
  }
};
