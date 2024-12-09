module.exports = (sequelize, Sequelize) => {
  const Booking = sequelize.define("booking", {
    name: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'rooms',
            key: 'id',
        },
    },
    startTime: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    endTime: {
        type: Sequelize.DATE,
        allowNull: false,
        // validate: {
        //     isAfterStart(value) {
        //         if (value <= this.startTime) {
        //             throw new Error('End time must be after start time');
        //         }
        //     },
        // },
    },
  });

  return Booking;
};
