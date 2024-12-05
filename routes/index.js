const routes =  (app) => {
  require("./user.routes.js")(app)
  require("./auth.routes.js")(app)
}

module.exports = routes;