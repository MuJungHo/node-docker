module.exports = app => {
  const verifyClientToken = require('../middlewares/room.auth.middleware');
  const client = require("../controllers/client.controller");
  const room = require("../controllers/room.controller");

  var router = require("express").Router();

  router.post("/booking", verifyClientToken, client.createBooking);
  router.put("/checkin", verifyClientToken, client.checkin);
  router.post("/login", client.login);
  router.get("/booking-list", verifyClientToken, client.findAllBooking);
  router.get("/me", verifyClientToken, client.findMe);

  app.use("/api/client", router);
};
