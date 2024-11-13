class Producer {
    constructor({ rabbitMQConnection }) {
        this.connection = rabbitMQConnection;
        this.config = this.connection.getConnectionConfiguration();
    }

    async publishMessages(messages) {
        for (const message of messages) {
            await this._publisher()(message);
        }

        await this._close();
    }

    _publisher() {
        return async (outboxMessage) => {
            try {
                const message = outboxMessage.getBody();
                const properties = outboxMessage.getProperties();

                const isPublished = await this.connection.publish(this.config.fanoutExchange, "", JSON.stringify(message), { ...properties, persistent: true });
                if (!isPublished) throw new Error('Message could not be published.');
                console.log('class Producer - isPublished: ', isPublished);

                await outboxMessage.markAsSent();
                await outboxMessage.save();
            } catch (error) {
                console.log(`Error while publishing message ${outboxMessage.type} with id ${outboxMessage.message_id}`, error);
            }
        };
    }

    async _close() {
        await this.connection.closeChannel();
    }
}

module.exports = Producer;
