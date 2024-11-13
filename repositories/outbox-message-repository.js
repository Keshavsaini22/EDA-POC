const db = require("../models");
const { sequelize } = require("../config").dbConnection
const { BaseRepository } = require('./base-repository');
const { OutBoxStatus } = require("../models/outbox-message/outbox-status");
class OutboxMessageRepository extends BaseRepository {

    
    async storeOutboxMessage(outbox_message, transaction) {

        const payload = {
            message_id: outbox_message.getId(),
            type: outbox_message.getType(),
            properties: outbox_message.getProperties(),
            headers: outbox_message.getHeaders(),
            body: outbox_message.getPayload(),
        };

        return this.create(payload, { transaction });
    }

    async getUnsentMessages(limit) {
        let criteria = {
            status: OutBoxStatus.ENUM.PENDING_STATUS
        };

        let order = [
            ['id', 'ASC']
        ];

        return this.findAll({ criteria, order, limit });
    }
}
module.exports = {
    outboxMessageRepository: new OutboxMessageRepository({
        dbConnection: sequelize,
        model: db['outbox_message'],
    }),
};
