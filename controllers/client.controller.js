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
    } while (currentDate <= new Date(`${endDate} 23:59:59`));
  } else if (frequency === "weekly" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthDates.push(moment(currentDate).date());
      currentDate.setDate(currentDate.getDate() + 7);
    } while (currentDate <= new Date(`${endDate} 23:59:59`));
  } else if (frequency === "monthly" && endDate) {
    do {
      dates.push(moment(currentDate).format("YYYY-MM-DD"));
      weekdays.push(moment(currentDate).weekday());
      monthDates.push(moment(currentDate).date());
      currentDate.setMonth(currentDate.getMonth() + 1);
    } while (currentDate <= new Date(`${endDate} 23:59:59`));
  }

  return { weekdays, monthDates, dates }
}

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    const room = await Room.findOne({ where: { account } });

    if (!room) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, room.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({ id: room.id }, 'pad-key', {
      expiresIn: '365d',
    });

    res.status(200).json({ token, room })

    // res.status(200).redirect(`/#/pad-login/${token}`)

  } catch (err) {

    res.status(404).send({ err });

  }
}

exports.findAllBooking = async (req, res) => {
  try {
    // console.log('findAllBooking', req.roomId)
    const roomId = req.roomId;

    const { startDateUnix, endDateUnix, startTime } = req.query;

    const startDateTime = moment.unix(startDateUnix).format("YYYY-MM-DD 00:00:00");
    const endDateTime = moment.unix(endDateUnix).format("YYYY-MM-DD 23:59:59");
    const startDate = moment.unix(startDateUnix).format("YYYY-MM-DD")

    const where = {
      roomId,
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

exports.findMe = async (req, res) => {
  try {
    const id = req.roomId;
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
      monthDates,
      dates,
      checkinDates: [moment().format("YYYY-MM-DD")]
    });

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

    const { account, password, bookingId, date } = req.body;

    const user = await User.findOne({ where: { account } });

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const _userId = user.id;

    let { userId, checkinDates: _checkinDates } = await Booking.findByPk(bookingId);

    if (_userId !== userId) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    _checkinDates.push(date);

    await Booking.update({ checkinDates: _checkinDates }, {
      where: { id: bookingId }
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