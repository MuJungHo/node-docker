module.exports = app => {
  const verifyClientToken = require('../middlewares/room.auth.middleware');
  const client = require("../controllers/client.controller");
  const room = require("../controllers/room.controller");

  var router = require("express").Router();

  router.post("/booking", verifyClientToken, client.createBooking);
  router.put("/checkin", verifyClientToken, client.checkin);

  app.use("/api/client", router);
};
