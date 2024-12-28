const db = require("../models");
const Booking = db.Booking;
const Room = db.Room;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {
    // console.log(req)
    const booking = {
      name: req.body.name,
      userId: req.id,
      roomId: req.body.roomId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      frequency: req.body.frequency
    };

    const data = await Booking.create(booking)

    res.send(data);
    
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

exports.findAll = (req, res) => {
  try {

    const keyword = req.query.keyword;
    const userId = req.id;
    const roomId = req.query.roomId;
    const page = req.query.page || 0;
    const limit = req.query.limit || 10;
    const offset = page * limit;
    const column = req.query.sort || null;
    const direction = req.query.order || null;
    const order = column && direction ? [[column, direction]] : null;
    const start = Number(req.query.start * 1000) || null;
    const end = Number(req.query.end * 1000) || null;

    const where = {
      userId,
      [Op.or]: [
        {
          endDate: { [Op.gt]: new Date(start) },
          startDate: { [Op.lte]: new Date(end) }
        },
        {
          endDate: null,
          // frequency: { [Op.not]: 0 },
          startDate: { [Op.lte]: new Date(end) }
        },
      ],
    };

    if (keyword) where["name"] = { [Op.iLike]: `%${keyword}%` };
    if (roomId) where["roomId"] = roomId;

    Booking.findAndCountAll({
      where,
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

exports.findAvailableRoom = async (req, res) => {
  try {

    const startAt = req.query.startAt;

    const where = {
      endTime: { [Op.gt]: startAt },
      startTime: { [Op.lte]: startAt }
    };

    let bookings = await Booking.findAll({
      where
    })

    const excludeBookingId = bookings.map(booking => booking.roomId);

    const page = req.query.page || 0;
    const limit = req.query.limit || 10;
    const offset = page * limit;
    const column = req.query.sort || null;
    const direction = req.query.order || null;
    const order = column && direction ? [[column, direction]] : null;

    let rooms = await Room.findAndCountAll({
      where: {
        id: { [Op.notIn]: excludeBookingId },
      },
      offset,
      limit,
      order,
    })

    res.send(rooms);

  } catch (err) {
    res.status(500).send({
      message:
        err.message
    });
  }
}


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

