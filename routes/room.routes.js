module.exports = app => {
  const room = require("../controllers/room.controller");
  const verifyToken = require('../middlewares/auth.middleware');

  var router = require("express").Router();

  router.post("/create", verifyToken, room.create);

  router.get("/list", verifyToken, room.findAll);
  router.get("/", verifyToken, room.findOne);
  router.get("/avaliable", verifyToken, room.findAvaliable);

  router.put("/update", verifyToken, room.update);

  router.delete("/delete", verifyToken, room.delete);

  app.use("/api/room", router);
};
