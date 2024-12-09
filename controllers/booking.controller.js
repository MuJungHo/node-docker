const db = require("../models");
const Booking = db.booking;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {

    const booking = {
      name: req.body.name,
      userId: req.body.userId,
      roomId: req.body.roomId,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    };

    Booking.create(booking)
      .then(data => {
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

    Booking.findAndCountAll({
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
    Booking.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Booking with id=${id}.`
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

    Booking.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "Booking was updated successfully."
          });
        } else {
          res.send({
            message: `Cannot update Booking with id=${id}. Maybe Booking was not found or req.body is empty!`
          });
        }
      })
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Booking with id=" + id
    });
  }
};


exports.delete = (req, res) => {
  const id = req.query.id;

  Booking.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Booking was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Booking with id=${id}. Maybe Booking was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Booking with id=" + id
      });
    });
};

