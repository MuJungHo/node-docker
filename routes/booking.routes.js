module.exports = app => {
  const booking = require("../controllers/booking.controller");
  const verifyToken = require('../middlewares/auth.middleware');

  var router = require("express").Router();

  router.post("/create", verifyToken, booking.create);

  router.get("/list", verifyToken, booking.findAllBooking);
  router.get("/", verifyToken, booking.findOne);
  router.get("/avaliable", verifyToken, booking.findAvaliable);

  router.put("/update", verifyToken, booking.update);

  router.delete("/delete", verifyToken, booking.delete);

  app.use("/api/booking", router);
};
