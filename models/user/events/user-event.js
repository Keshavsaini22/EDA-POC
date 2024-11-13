const { Event } = require("../../common/event");

class UserEvent extends Event {
    getBody() {
        return {
            user: this.payload
        };
    }
}

exports.UserEvent = UserEvent;