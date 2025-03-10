const db = require("../models");
const websocket = require("../websocket");
const Booking = db.Booking;
const Room = db.Room;
const Op = db.Sequelize.Op;
const moment = require("moment");


const getExpandDates = (startDate, endDate, frequency = "daily") => {
  let weekdays = [];
  let monthDates = [];
  let dates = [];
  let currentDate = new Date(startDate);

  if (frequency === "once") {
    dates = [moment(startDate).format("YYYY-MM-DD")];
    weekdays = [moment(startDate).weekday()];
    monthDates = [moment(startDate).date()];
  } else if (frequency === "daily" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthDates.push(moment(currentDate).date());
      currentDate.setDate(currentDate.getDate() + 1);
    } while (currentDate < new Date(endDate));
  } else if (frequency === "weekly" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthDates.push(moment(currentDate).date());
      currentDate.setDate(currentDate.getDate() + 7);
    } while (currentDate < new Date(endDate));
  } else if (frequency === "monthly" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthDates.push(moment(currentDate).date());
      currentDate.setMonth(currentDate.getMonth() + 1);
    } while (currentDate < new Date(endDate));
  }

  return { weekdays, monthDates, dates }
}

exports.create = async (req, res) => {
  try {
    const userId = req.id;

    const {
      roomId,
      startDate,
      endDate,
      startTime,
      frequency,
      name
    } = req.body;

    const { weekdays, monthDates, dates } = getExpandDates(startDate, endDate, frequency);

    const conflicts = await Booking.findAll({
      where: {
        roomId,
        startTime,
        [Op.or]: [
          frequency === "once" && {
            startDate: { [Op.lte]: startDate },
            endDate: { [Op.gte]: startDate },
            dates: { [Op.overlap]: [startDate] }
          },
          ["daily", "weekly", "monthly"].includes(frequency) && {
            startDate: { [Op.between]: [startDate, endDate] },
            endDate: { [Op.between]: [startDate, endDate] },
            dates: { [Op.overlap]: dates },
            weekdays: { [Op.overlap]: weekdays },
            monthDates: { [Op.overlap]: monthDates },
          }
        ]
      }
    });

    websocket.send("add new booking", roomId);

    if (conflicts.length > 0) {
      return res.status(409).json({ conflicts });
    }

    const booking = await Booking.create({
      name,
      userId,
      roomId,
      startDate,
      endDate,
      startDateTime: new Date(`${startDate} 00:00:00`),
      endDateTime: new Date(`${endDate} 00:00:00`),
      endDate,
      frequency,
      startTime,
      weekdays,
      monthDates,
      dates,
      checkinDates: []
    });
    res.status(201).json({ message: 'Booking created successfully.', booking });

  } catch (err) {

    res.status(500).send({
      message: err.message
    });

  }
};

exports.findAllBooking = async (req, res) => {
  try {
    // console.log('findAllBooking')
    const userId = req.id;

    const { roomId, startDateUnix, endDateUnix, startTime } = req.query;

    const startDateTime = moment.unix(startDateUnix).format("YYYY-MM-DD 00:00:00");
    const endDateTime = moment.unix(endDateUnix).format("YYYY-MM-DD 00:00:00");
    const startDate = moment.unix(startDateUnix).format("YYYY-MM-DD")

    const where = {
      userId,
      [Op.or]: [
        {
          startDateTime: { [Op.between]: [startDateTime, endDateTime] },
        },
        {
          endDateTime: { [Op.between]: [startDateTime, endDateTime] },
        },
        {
          dates: { [Op.overlap]: [startDate] }
        },
      ]
    };

    if (roomId) where["roomId"] = roomId
    if (startTime) where["startTime"] = { [Op.gte]: startTime }

    const bookings = await Booking.findAndCountAll({
      where,
      order: [["startTime", "ASC"]]
    });

    res.send(bookings);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

exports.findAvaliable = async (req, res) => {
  try {
    // const userId = req.id;
    const { startDateUnix, endDateUnix, startTime } = req.query;

    const rooms = await Room.findAll();
    const roomIds = rooms.map(room => room.id);
    const startDate = moment.unix(startDateUnix).format("YYYY-MM-DD");
    const startDateTime = moment.unix(startDateUnix).format("YYYY-MM-DD 00:00:00");
    const endDateTime = moment.unix(endDateUnix).format("YYYY-MM-DD 00:00:00");

    const where = {
      // userId,
      [Op.or]: [
        {
          startDateTime: { [Op.between]: [startDateTime, endDateTime] },
        },
        {
          endDateTime: { [Op.between]: [startDateTime, endDateTime] },
        },
        {
          dates: { [Op.overlap]: [startDate] }
        },
      ]
    };

    if (startTime) where["startTime"] = { [Op.gte]: startTime }
    if (roomIds.length > 0) where["roomId"] = { [Op.in]: roomIds }

    const bookings = await Booking.findAndCountAll({ where });


    const bookedTimes = bookings
      .filter(booking => booking.startDate === startDate)

    const allTimes = Array.from({ length: 24 }, (_, i) => i);

    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

    res.send(availableTimes);

  } catch (err) {
    res.status(500).send({
      message: err.message
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
