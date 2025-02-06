const db = require("../models");
const Room = db.Room;
const Booking = db.Booking;
const Op = db.Sequelize.Op;
const moment = require("moment");


const findAllBookings = async (roomIds = [], userId, startDateUnix, endDateUnix, startTime) => {
  const endDate = moment.unix(endDateUnix).format("YYYY-MM-DD");
  const where = {
    userId,
    startTime: { [Op.gte]: startTime },
    [Op.or]: [
      {
        startDate: { [Op.lte]: endDate }
      },
      {
        endDate: { [Op.lte]: endDate }
      }
    ]
  };
  // console.log(roomIds)
  if (roomIds.length > 0) where["roomId"] = { [Op.in]: roomIds }

  const bookings = await Booking.findAndCountAll({
    where,
    order: [["startTime", "ASC"]]
  });

  return bookings
};

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

exports.findAvaliable = async (req, res) => {
  try {
    const userId = req.id;
    const { startDateUnix, endDateUnix, startTime } = req.query;

    const rooms = await Room.findAll();
    const roomIds = rooms.map(room => room.id);

    const { rows: bookings } = await findAllBookings(roomIds, userId, startDateUnix, endDateUnix, startTime);

    const startDate = moment.unix(startDateUnix).format("YYYY-MM-DD");

    const bookedRooms = bookings
      .filter(booking => booking.startDate == startDate && booking.startTime == startTime)
      .map(booking => booking.roomId);
    // const bookedTimes = bookings
    //   .filter(booking => booking.startDate === startDate)
    // .map(booking => booking.startTime);

    // console.log(bookedRooms)

    // const allTimes = Array.from({ length: 24 }, (_, i) => i);
    const availableRooms = rooms.filter(room => !bookedRooms.includes(room.id));
    // const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

    res.send(availableRooms);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
}

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

