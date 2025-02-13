module.exports = app => {
  const room = require("../controllers/room.controller");
  const verifyToken = require('../middlewares/auth.middleware');
  const verifyPadToken = require('../middlewares/room.auth.middleware');

  var router = require("express").Router();

  router.post("/create", verifyToken, room.create);

  router.get("/list", verifyToken, room.findAll);
  router.get("/", verifyToken, room.findOne);
  router.get("/avaliable", verifyToken, room.findAvaliable);

  router.put("/update", verifyToken, room.update);

  router.delete("/delete", verifyToken, room.delete);

  router.post("/verify", room.verify);
  router.post("/login", room.login);
  router.get("/booking-list", verifyPadToken, room.findAllBooking);
  router.get("/me", verifyPadToken, room.findMe);

  app.use("/api/room", router);
};
