const Sequelize = require("sequelize");
const dbConfig = {
  HOST: "192.168.80.42",
  USER: "deltapq",
  PORT: 5433,
  PASSWORD: "zsxc3f1q2w3e4r#$",
  DB: "SpaceMgt",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.PORT,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const User = require("./user.model.js")(sequelize, Sequelize);
const Room = require("./room.model.js")(sequelize, Sequelize);
const Booking = require("./booking.model.js")(sequelize, Sequelize);

db.user = User;
db.room = Room;
db.booking = Booking;

// User.hasMany(Booking, { foreignKey: 'userId' });
// Booking.belongsTo(User, { foreignKey: 'userId' });

// Room.hasMany(Booking, { foreignKey: 'roomId' });
// Booking.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = db;
