const amqp = require("amqplib");

const config = {
    host: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    vhost: process.env.RABBITMQ_VHOST,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    appName: process.env.APP_NAME,
    fanoutExchange: process.env.RABBITMQ_FANOUT_EXCHANGE,
    directExchange: process.env.RABBITMQ_DIRECT_EXCHANGE,
    primaryQueue: process.env.RABBITMQ_PRIMARY_QUEUE,
    retryQueue: process.env.RABBITMQ_RETRY_QUEUE,
    retryBindingKey: process.env.RABBITMQ_RETRY_BINDING_KEY,
    errorBindingKey: process.env.RABBITMQ_ERROR_BINDING_KEY,
    delayedRetriesNumber: process.env.FAILED_MESSAGE_DELAYED_RETRIES,
    immediateRetriesNumber: process.env.FAILED_MESSAGE_IMMEDIATE_RETRIES,
    retryQueueMessageTtl: process.env.RETRY_QUEUE_MESSAGE_TTL,
}

class RabbitMQConfig {

    constructor(ora) {
        this.ora = ora;
        this.validateConfig(config);
        this.config = config;
    }

    async validateConfig(config) {
        const spinner = this.ora('Checking prerequisites...').start();

        if (!config) {
            spinner.fail(`Config is empty`);
            process.exit(1); // Exit the process with an error code
        }

        const requiredVariables = ["username", "password", "host", "port", "vhost", "appName", "fanoutExchange", "directExchange", "primaryQueue", "retryQueue", "retryBindingKey", "errorBindingKey", "delayedRetriesNumber", "immediateRetriesNumber", "retryQueueMessageTtl"];
        const missingVariables = requiredVariables.filter(variable => !config[variable]);

        if (missingVariables.length === 0) spinner.succeed('All prerequisites are met for RabbitMQ.');
        else {
            missingVariables.forEach(variable => { spinner.fail(`Missing required environment variable: ${variable}`) });
            process.exit(1); // Exit the process with an error code
        }
    }

    getConfig() {
        return this.config;
    }

    getConnectionString() {
        return `${this.config.host}:${this.config.port}/${this.config.vhost}`;
    }

    getConnectionParams() {
        return {
            credentials: amqp.credentials.plain(this.config.username, this.config.password),
            heartbeat: 30, // Set the heartbeat interval for the connection
        };
    }

}

module.exports = {
    RabbitMQConfig,
}