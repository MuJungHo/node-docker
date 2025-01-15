const db = require("../models");
const Booking = db.Booking;
const Room = db.Room;
const Op = db.Sequelize.Op;
const moment = require("moment");

exports.create = async (req, res) => {
  try {
    const { roomId, startDate, endDate, startTime, endTime, frequency, name } = req.body;
    const userId = req.id;

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
    if (conflicts.length > 0) {
      return res.status(409).json({ conflicts });
    }



    // Create booking
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
    };

    if (keyword) where["name"] = { [Op.iLike]: `%${keyword}%` };
    if (roomId) where["roomId"] = roomId;

    Booking.findAndCountAll({
      where,
      // offset,
      // limit,
      order: [["startTime", "asc"], ["startDate", "asc"]]
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
    const date = req.query.date;
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;


    const where = {
      [Op.or]: [
        {
          frequency: 0,
          startDate: startDate,
          [Op.not]: {
            startTime: { [Op.gte]: endTime },
            endTime: { [Op.lte]: startTime },
          },
        },
        {
          frequency: { [Op.gte]: 1 },
          [Op.or]: [
            {
              startDate: { [Op.gte]: date },
              endDate: null
            },
            {
              endDate: { [Op.gt]: date },
              startDate: { [Op.lte]: date }
            },
          ],
          [Op.not]: {
            startTime: { [Op.gte]: endTime },
            endTime: { [Op.lte]: startTime },
          },
        }
      ]
    }

    let existedBookings = await Booking.findAll({
      where
    })

    const excludeBookingId = existedBookings.map(booking => booking.roomId);

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

