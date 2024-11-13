class Consumer {
    constructor({ rabbitMQConnection, messageHandler, limit }) {
        this.connection = rabbitMQConnection;
        this.config = this.connection.getConnectionConfiguration();
        this.messageHandler = messageHandler;
        this.channel = null;
        this.signatureTypes = null;
        this.prefetchLimit = limit;
        this.signatureTypes = this.messageHandler.getSignatureType();

        this.connection.rabbitMqEvents.on("connected", () => {
            console.log("RabbitMQ connected");
            this._consume();
        });

    }

    init() {
        this._consume();
    }

    async _consume() {
        this.channel = this.connection.getChannel();
        this.channel.prefetch(this.prefetchLimit);
        await this.startConsuming();
        console.log(`Waiting for messages in ${this.config.primaryQueue}...`);
    }

    async startConsuming() {
        await this.channel.consume(this.config.primaryQueue, async (message) => {
            if (message === null) return;

            console.log("\n\n================= NEW MESSAGE CONSUMING AT", new Date(), "=================");

            const redeliveryCount = message.properties.headers['redelivery_count'] || 0;
            const type = message?.properties?.type || message?.properties?.headers?.type;

            console.log('INFO Received message:', type, "|", 'Message redelivery count:', redeliveryCount);

            if (!message.properties?.messageId) {
                console.log('INFO Message ignored: Message does not have a messageId.');
                this?.channel.ack(message);
                return;
            }

            if (!type || !this.signatureTypes.includes(type)) {
                console.log("INFO Message ignored: No available handler found or missing message type property.");
                this?.channel.ack(message);
                return;
            }

            try {
                await this.messageHandler.handleMessage(message, parseInt(this.config.immediateRetriesNumber));
            } catch (error) {
                await this._handleError(message, error, redeliveryCount);
            } finally {
                this?.channel.ack(message);
            }

        });
    }

    async _handleError(message, error, redeliveryCount) {
        if (this._hasBeenRedeliveredTooMuch(redeliveryCount)) await this.connection.deadLetter(message, error);
        else await this.connection.retry(message, error);
    }

    _hasBeenRedeliveredTooMuch(redeliveryCount) {
        return (parseInt(redeliveryCount) >= parseInt(this.config.delayedRetriesNumber));
    }
}

module.exports = Consumer;