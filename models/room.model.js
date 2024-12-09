module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define("room", {
    name: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER
    }
  });

  return Room;
};
