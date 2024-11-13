const { userRepository, inboxMessageRepository } = require("../repositories");

class NotifyRegisterProcessor {

    getHandlerName() {
        return this.constructor.name;
    }

    async handleEvent(payload) {
        await userRepository.handleManagedTransaction(async (transaction) => {
            console.log('payload: ', payload.messageId);
            await inboxMessageRepository.storeInboxMessage({ message_id: payload.messageId, handler_name: this.getHandlerName() }, transaction);
        })
    }
}

module.exports = new NotifyRegisterProcessor();