const { ENUM } = require("../common/enum");
class OutBoxStatus extends ENUM {
    static ENUM = {
        PENDING_STATUS: 'PENDING',
        SENT_STATUS: 'SENT'
    }
}

exports.OutBoxStatus = OutBoxStatus;