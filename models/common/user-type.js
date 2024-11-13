const { ENUM } = require('./enum')

class UserType extends ENUM {
    static ENUM = {
        WHISTLEBLOWER: "whistleblower",
        REPORT_MANAGER: "report_manager",
        WITNESS: "witness"
    }
}

exports.UserType = UserType
