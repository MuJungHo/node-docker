const db = require("../models");
const Room = db.room;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {

    const room = {
      name: req.body.name
    };

    Room.create(room)
      .then(data => {
        res.send(data);
      })
  } catch (err) {
    res.status(500).send({
      message: err.message
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

    Room.findAndCountAll({
      where: condition,
      offset,
      limit,
      order,
    })
      .then((data) => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message
        });
      })
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};


exports.findOne = (req, res) => {
  try {
    const id = req.query.id;
    Room.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Room with id=${id}.`
          });
        }
      })
  } catch (err) {
    res.status(500).send({
      message:
        err.message
    });
  }
};


exports.update = (req, res) => {
  try {
    const id = req.query.id;

    Room.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Room was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Room with id=${id}. Maybe Room was not found or req.body is empty!`
          });
        }
      })
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Room with id=" + id
    });
  }
};


exports.delete = (req, res) => {
  const id = req.query.id;

  Room.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Room was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Room with id=${id}. Maybe Room was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Room with id=" + id
      });
    });
};

