module.exports = app => {
  const user = require("../controllers/user.controller");
  const verifyToken = require('../middlewares/auth.middleware');

  var router = require("express").Router();

  router.post("/create", verifyToken, user.create);

  router.get("/list", verifyToken, user.findAll);

  router.get("/", verifyToken, user.findOne);

  router.put("/update", verifyToken, user.update);

  router.delete("/delete", verifyToken, user.delete);

  // router.delete("/deteteAll", verifyToken, user.deleteAll);

  app.use("/api/user", router);
};
