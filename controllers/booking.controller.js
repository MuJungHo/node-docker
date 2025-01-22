const db = require("../models");
const Booking = db.Booking;
const Room = db.Room;
const Op = db.Sequelize.Op;
const moment = require("moment");

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

const getConflictBookings = async (roomId, endDate, startDate, startTime, endTime, frequency) => {

  const { weekdays, monthdates, dates } = getExpandDates(startDate, endDate, frequency);

  const conflicts = await Booking.findAll({
    where: {
      roomId,
      startTime: { [Op.between]: [startTime, endTime] },
      endTime: { [Op.between]: [startTime, endTime] },
      [Op.or]: [
        (endDate === null && (frequency === "daily" || frequency === 'monthly')) && {
          frequency: { [Op.in]: ['daily', 'monthly'] },
          endDate: null,
        },
        {
          frequency: "once",
          [Op.or]: [
            frequency === "once" && {
              startDate,
            },
            frequency === "daily" && {
              endDate: { [Op.lte]: startDate },
              startDate: { [Op.gte]: startDate },
            },
            frequency === "weekly" && {
              weekday: moment(startDate).weekday(),
              endDate: { [Op.lte]: startDate },
              startDate: { [Op.gte]: endDate },
            },
            frequency === "monthly" && {
              monthdate: moment(startDate).date(),
              endDate: { [Op.lte]: startDate },
              startDate: { [Op.gte]: endDate },
            },
          ],
        },
        {
          frequency: "daily",
          [Op.or]: [
            frequency === "once" && {
              [Op.or]: [
                {
                  startDate: { [Op.lte]: startDate },
                  endDate: null,
                },
                {
                  startDate: { [Op.lte]: startDate },
                  endDate: { [Op.gte]: startDate },
                }
              ]
            },
            frequency === "daily" && {
              [Op.or]: [
                endDate === null && {
                  startDate: { [Op.gte]: startDate },
                },
                {
                  startDate: { [Op.lte]: endDate },
                  endDate: null
                },
                {
                  startDate: { [Op.between]: [startDate, endDate] },
                },
                {
                  endDate: { [Op.between]: [startDate, endDate] },
                }
              ]
            },
            frequency === "weekly" && {
              [Op.or]: [
                {
                  weekdays: { [Op.overlap]: [moment(startDate).weekday()] },
                },
                {
                  startDate: { [Op.between]: [startDate, endDate] },
                },
                {
                  endDate: { [Op.between]: [startDate, endDate] }
                }
              ]
            },
            frequency === "monthly" && {
              [Op.or]: [
                {
                  monthdates: { [Op.overlap]: [moment(startDate).date()] }
                },
                {
                  startDate: { [Op.between]: [startDate, endDate] },
                },
                {
                  endDate: { [Op.between]: [startDate, endDate] }
                }
              ]
            },
          ],
        },
        {
          frequency: "weekly",
          [Op.or]: [
            frequency === "once" && {
              [Op.or]: [
                {
                  startDate,
                },
                {
                  startDate: { [Op.lte]: startDate },
                  endDate: null,
                  weekday: moment(startDate).weekday()
                },
                {
                  startDate: { [Op.lte]: startDate },
                  endDate: { [Op.gte]: startDate },
                  weekday: moment(startDate).weekday()
                }
              ]
            },
            frequency === "daily" && {
              [Op.or]: [
                {
                  dates: { [Op.overlap]: dates }
                },
                {
                  endDate: null,
                  weekday: { [Op.in]: weekdays },
                  startDate: { [Op.lte]: endDate }
                }
              ]
            },
            frequency === "weekly" && {
              weekday: moment(startDate).weekday(),
              startDate: { [Op.lte]: endDate }
            },
            frequency === "monthly" && {
              monthdates: { [Op.overlap]: monthdates },
              startDate: { [Op.lte]: endDate }
            }
          ]
        },
        {
          frequency: "monthly",
          [Op.or]: [
            frequency === "once" && {
              [Op.or]: [
                { startDate },
                {
                  startDate: { [Op.lte]: startDate },
                  endDate: null,
                  monthdate: moment(startDate).date()
                },
                {
                  startDate: { [Op.lte]: startDate },
                  endDate: { [Op.gte]: startDate },
                  monthdate: moment(startDate).date()
                }
              ]
            },
            frequency === "daily" && {
              [Op.or]: [
                {
                  dates: { [Op.overlap]: dates }
                },
                {
                  monthdates: { [Op.overlap]: monthdates },
                },
                {
                  endDate: null,
                  startDate: { [Op.lte]: endDate }
                },
                endDate === null && {
                  endDate: { [Op.gte]: startDate },
                }
              ]
            },
            frequency === "weekly" && {
              [Op.or]: [
                {
                  dates: { [Op.overlap]: dates }
                },
                {
                  monthdates: { [Op.overlap]: monthdates },
                },
                endDate === null && {
                  endDate: { [Op.gte]: startDate },
                  weekdays: { [Op.overlap]: [moment(startDate).weekday()] }
                }
              ]
            },
            frequency === "monthly" && {
              [Op.or]: [
                {
                  startDate: { [Op.lte]: endDate },
                  monthdate: moment(startDate).date()
                },
                // endDate === null && {
                //   endDate: { [Op.gte]: startDate },
                // }
              ]
            }
          ]
        }
      ]
    }
  });
  return conflicts
}

exports.create = async (req, res) => {
  try {
    const userId = req.id;

    const { roomId, startDate, endDate, startTime, endTime, frequency, name } = req.body;

    const conflicts = await getConflictBookings(roomId, endDate, startDate, startTime, endTime, frequency)

    if (conflicts.length > 0) {
      return res.status(409).json({ conflicts });
    }

    const { weekdays, monthdates, dates } = getExpandDates(startDate, endDate, frequency);

    const booking = await Booking.create({
      name,
      userId,
      roomId,
      startDate,
      endDate,
      frequency,
      startTime,
      endTime,
      weekdays,
      monthdates,
      dates,
      weekday: moment(startDate).weekday(),
      monthdate: moment(startDate).date(),
    });

    res.status(201).json({ message: 'Booking created successfully.', booking });
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {

    const userId = req.id;
    // const roomId = req.query.roomId;

    const { startDate, endDate, startTime, endTime } = req.query;
    const _startDate = moment.unix(startDate).format("YYYY-MM-DD");
    const _endDate = moment.unix(endDate).format("YYYY-MM-DD");
    // const { weekdays, monthdates, dates } = getExpandDates(_startDate, _endDate);
    // console.log(_startDate, _endDate)
    const where = {
      userId,
      // roomId,
      startTime: { [Op.between]: [startTime, endTime] },
      endTime: { [Op.between]: [startTime, endTime] },
      [Op.or]: [
        {
          startDate: { [Op.lte]: _endDate }
        },
        {
          endDate: { [Op.lte]: _endDate }
        }
      ]
    };


    const bookings = await Booking.findAndCountAll({ where })

    res.send(bookings);

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

