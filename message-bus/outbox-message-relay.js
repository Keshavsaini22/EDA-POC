class OutboxMessageRelay {
    constructor({ producer, outboxMessageRepository }) {
        this.producer = producer;
        this.outbox = outboxMessageRepository;
    }

    async execute(maxMessages) {
        try {
            const messages = await this.outbox.getUnsentMessages(maxMessages);

            if (!messages.length) {
                console.log("INFO: No messages pending to dispatch.");
                return;
            }

            await this.producer.publishMessages(messages);

            console.log('Done publishing messages');
        } catch (error) {
            console.error('Error executing OutboxMessageRelay:', error);
        }
    }
}

module.exports = OutboxMessageRelay;
