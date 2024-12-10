const db = require("../models");
const User = db.User;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');

exports.create = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = {
      name: req.body.name,
      email: req.body.email,
      account: req.body.account,
      password: hashedPassword,
    };

    User.create(user)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating users."
        });
      })
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating users."
    });
  }

};

exports.findAll = (req, res) => {
  try {

    const keyword = req.query.keyword || '';
    const page = req.query.page || 0;
    const limit = req.query.limit || 10;
    const offset = page * limit;
    const condition = keyword ? { name: { [Op.iLike]: `%${keyword}%` } } : null;
    const column = req.query.sort || null;
    const direction = req.query.order || null;
    const order = column && direction ? [[column, direction]] : null;

    User.findAndCountAll({
      where: condition,
      offset,
      limit,
      order,
      attributes: {
        exclude: ['password']
      }
    })
      .then((data) => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving users."
        });
      })
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving users."
    });
  }
};


exports.findOne = (req, res) => {
  try {
    const id = req.query.id;
    User.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    })
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find User with id=${id}.`
          });
        }
      })
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while finding user."
    });
  }
};


exports.update = (req, res) => {
  try {
    const id = req.query.id;

    User.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "User was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
          });
        }
      })
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating User with id=" + id
    });
  }
};


exports.delete = (req, res) => {
  const id = req.query.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};


// exports.deleteAll = (req, res) => {
//   User.destroy({
//     where: {},
//     truncate: false
//   })
//     .then(nums => {
//       res.send({ message: `${nums} User were deleted successfully!` });
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while removing all user."
//       });
//     });
// };
