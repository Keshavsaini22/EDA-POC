const { userService } = require("../services");

class UserController {
    static async registerUser(req, res) {
        try {
            const response = await userService.registerUser({ body: req.body })
            res.status(200).json(response)
        } catch (error) {
            console.log('error in registerUser: ', error);

        }
    }
}

module.exports = UserController
