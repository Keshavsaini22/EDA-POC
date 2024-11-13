const { UserEvent } = require("./user-event");

class UserRegister extends UserEvent {
    type = "eda.poc.register";
}

exports.UserRegister = UserRegister;