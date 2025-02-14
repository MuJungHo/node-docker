const db = require("../models");
const Booking = db.Booking;
const User = db.User;
const Room = db.Room;
const Op = db.Sequelize.Op;
const moment = require("moment");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const websocket = require('../websocket');


const getExpandDates = (startDate, endDate, frequency = "daily") => {
  let weekdays = [];
  let monthdates = [];
  let dates = [];
  let currentDate = new Date(startDate);

  if (frequency === "once") {
    dates = [moment(startDate).format("YYYY-MM-DD")];
    weekdays = [moment(startDate).weekday()];
    monthdates = [moment(startDate).date()];
  } else if (frequency === "daily" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthdates.push(moment(currentDate).date());
      currentDate.setDate(currentDate.getDate() + 1);
    } while (currentDate <= new Date(`${endDate} 23:59:59`));
  } else if (frequency === "weekly" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthdates.push(moment(currentDate).date());
      currentDate.setDate(currentDate.getDate() + 7);
    } while (currentDate <= new Date(`${endDate} 23:59:59`));
  } else if (frequency === "monthly" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthdates.push(moment(currentDate).date());
      currentDate.setMonth(currentDate.getMonth() + 1);
    } while (currentDate <= new Date(`${endDate} 23:59:59`));
  }

  return { weekdays, monthdates, dates }
}

exports.createBooking = async (req, res) => {
  try {

    const { account, password, name, startDate, endDate, startTime, frequency } = req.body;

    const user = await User.findOne({ where: { account } });

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const userId = user.id;

    const roomId = req.roomId;
    // const {
    //   roomId,
    //   startDate,
    //   endDate,
    //   startTime,
    //   frequency,
    //   name
    // } = req.body;

    const { weekdays, monthdates, dates } = getExpandDates(startDate, endDate, frequency);

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
            monthdates: { [Op.overlap]: monthdates },
          }
        ]
      }
    });


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
      endDateTime: new Date(`${endDate} 23:59:59`),
      endDate,
      frequency,
      startTime,
      weekdays,
      monthdates,
      dates,
      checkin: true
    });

    await Room.update({ available: false }, {
      where: { id: roomId }
    })


    websocket.send("add new booking", roomId);

    res.status(201).json({ message: 'Booking created successfully.', booking });

  } catch (err) {

    res.status(500).send({
      message: err.message
    });

  }
};

exports.checkin = async (req, res) => {
  try {
    const id = req.roomId;

    const { account, password, bookingId } = req.body;

    const user = await User.findOne({ where: { account } });

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const userId = user.id;

    const booking = await Booking.findByPk(bookingId);

    if (userId !== booking.userId) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    await Booking.update({ checkin: true }, {
      where: { id: bookingId }
    })

    await Room.update({ available: false }, {
      where: { id: id }
    })

    res.send({
      message: "checkind was successfully."
    });

    
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Room with id=" + id
    });
  }
}