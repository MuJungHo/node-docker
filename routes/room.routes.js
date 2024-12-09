module.exports = app => {
  const room = require("../controllers/room.controller");
  const verifyToken = require('../middlewares/auth.middleware');

  var router = require("express").Router();

  router.post("/create", room.create);

  router.get("/list", verifyToken, room.findAll);

  router.get("/", verifyToken, room.findOne);

  router.put("/update", verifyToken, room.update);

  router.delete("/delete", verifyToken, room.delete);

  app.use("/api/room", router);
};
