const EventEmitter = require("events");
const ora = require('ora-classic');
const amqp = require("amqplib");


class RabbitMQConnection {

    constructor(params) {
        const { rabbitMQConfig, reconnectPolicy = false, maxReconnectTries } = params;
        this._rabbitMqConfig = rabbitMQConfig;
        this.config = this._rabbitMqConfig.getConfig();
        this.rabbitMqEvents = new EventEmitter();
        this._maxReconnectTries = reconnectPolicy ? (maxReconnectTries || 3) : 0;
        this._reconnectTries = 0;
        this._isMaxReconnectPolicyApplied = reconnectPolicy;
        this.ora = ora;
        this.connection = null;
        this.channel = null;
        this.timeout = null;
    }

    async connect() {
        const spinner = this.ora("Connecting to RabbitMQ...").start();
        try {
            if (this.timeout) clearTimeout(this.timeout);

            this.connection = await this.createConnection();
            spinner.succeed("RabbitMQ is connected.");

            this.channel = await this.createChannel();
            this.handleConnectionEvents();

            this.rabbitMqEvents.emit("connected");
            this._reconnectTries = 0;
        } catch (error) {
            spinner.fail(`Failed to establish connection to RabbitMQ: ${error.message || error}`);
            await this._reconnect();
        }
    }

    async createConnection() {
        const connectionString = this._rabbitMqConfig.getConnectionString();
        const connectionParams = this._rabbitMqConfig.getConnectionParams();
        return amqp.connect(connectionString, connectionParams);
    }

    async createChannel() {
        if (!this.connection) throw new Error("RabbitMQ connection has not been established yet.");
        const channel = await this.connection.createChannel();
        console.log("Channel created.");
        return channel;
    }

    handleConnectionEvents() {
        this.connection.on("close", this._handleClose.bind(this));
        this.connection.on("error", this._handleError.bind(this));

        this.channel.on("error", (err) => {
            console.log("Error in channel", err);
        });

        this.channel.on("close", () => {
            console.log("Channel closed");
            this.channel = null;
            setTimeout(this._reconnect.bind(this), 5000);
        });
    }

    async _handleClose() {
        console.log("Disconnected from RabbitMQ");
        if (this.timeout) clearTimeout(this.timeout);
        await this._reconnect();
    }

    async _handleError(e) {
        console.log("Error in RabbitMQ connection", e);
        if (this.timeout) clearTimeout(this.timeout);
        await this._reconnect();
    }

    async _reconnect() {
        return new Promise(resolve => {
            this.timeout = setTimeout(async () => {
                console.log("Retires", this._reconnectTries);
                this._reconnectTries++;

                if (this._isMaxReconnectPolicyApplied && this._hasExceededMaxReconnects(this._reconnectTries)) {
                    console.log("Maximum reconnect tries reached, Process exited");
                    process.exit(1);
                }

                console.log("Reconnecting to RabbitMQ...", "Attempt:", this._reconnectTries, new Date());
                await this.connect(this._isMaxReconnectPolicyApplied);

                resolve();
            }, 5000); // Wait for 5 seconds before attempting to reconnect
        });
    }

    _hasExceededMaxReconnects(reconnectTries) {
        return (reconnectTries > this._maxReconnectTries);
    }

    getChannel() {
        return this.channel;
    }

    getConnectionConfiguration() {
        return this.config;
    }

    async exchange(exchange, exchangeType) {
        await this.channel?.assertExchange(exchange, exchangeType, { durable: true });
    }

    async queue(exchange, queue, routingKey = "", options = {}) {
        await this.channel?.assertQueue(queue, options);
        await this.channel?.bindQueue(queue, exchange, routingKey);
    }

    async publish(exchange, bindingKey, content, properties) {
        return this.channel?.publish(exchange, bindingKey, Buffer.from(content), properties);
    }

    async closeChannel() {
        await this?.channel?.close();
        this.channel = null;
        console.log("Channel closed explicitly.");
    }

    async deadLetter(message, error) {
        const properties = { ...message.properties, persistent: true };
        const poissonMessage = this._convertToPoissonMessageFormat(message, error);
        console.log(`ERROR RecoverabilityExecutor Moving message ${message?.properties?.messageId} to error queue because processing failed due to an exception:\n`, error);
        return this.publish(this.config.directExchange, this.config.errorBindingKey, JSON.stringify(poissonMessage), properties);
    }

    _convertToPoissonMessageFormat(message, error) {
        return {
            payload: JSON.parse(message.content?.toString() || '{}'),
            exception_details: {
                exception_type: error.message,
                stack_trace: error.stack,
                failed_at: new Date()
            },
            endpoint: {
                name: this.config.appName,
                delivery_metadata: {
                    message_type: message?.properties?.type || message?.properties?.headers?.type,
                    exchange: message.fields.exchange,
                    routing_key: message.fields.routingKey
                }
            }
        }
    }

    async retry(message, error) {
        const messageProperties = this._incrementRedeliveryCountAndSetTTL(message);
        const properties = { ...messageProperties, persistent: true };

        console.log(`WARN RecoverabilityExecutor Delayed Retries will reschedule message ${message.properties.messageId} after a delay of ${message.properties.expiration / 1000} seconds because of exception:\n`, error);
        return this.publish(this.config.directExchange, this.config.retryBindingKey, message.content, properties);
    }

    _incrementRedeliveryCountAndSetTTL(message) {
        const redeliveryCount = parseInt(message.properties.headers['redelivery_count'] || 0);
        message.properties.headers['redelivery_count'] = redeliveryCount + 1;
        message.properties.expiration = message.properties.headers['redelivery_count'] * 2000; // Exponential backoff: 2 seconds base delay

        return message.properties;
    }

}

module.exports = {
    RabbitMQConnection,
};