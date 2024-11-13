const { UserRegister } = require("../models/user/events/user-register");
const { userRepository, outboxMessageRepository } = require("../repositories");

class UserService {
    static async registerUser(payload) {
        return await userRepository.handleManagedTransaction(async (transaction) => {
            const { body } = payload
            const response = await userRepository.registerUser(body, transaction);

            await outboxMessageRepository.storeOutboxMessage(new UserRegister(response), transaction)
            return response;
        })

    }
}

module.exports = UserService