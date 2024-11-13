require("dotenv").config();
const { Command } = require("commander");
const Consumer = require("../workers/consumer");
const { RabbitMQConfig } = require("../rabbitmq/rabbitmq-config");
const { RabbitMQConnection } = require("../rabbitmq/rabbitmq-connection");
const { RabbitMQConfigurer } = require("../rabbitmq/rabbitmq-configurer");
const { dbConnection } = require("../../config");
const { messageHandler } = require("../inbox-message-handler");
const ora = require('ora-classic');

const program = new Command();

program
    .name("handle-messages")
    .option("-l, --limit <limit>", "Number of messages to handle", process.env.CONSUME_MESSAGE_LIMIT || 10)
    .description("Handle messages with an optional limit")
    .action(async ({ limit }) => {
        try {
            const parsedLimit = parseInt(limit);
            if (isNaN(parsedLimit)) throw new Error(`TypeError: Option 'limit' is the wrong type,must be an integer got:${limit}`);
            console.log(`Handling messages with limit: ${parsedLimit}`);

            await dbConnection.checkConnection();

            const rabbitMQConnection = new RabbitMQConnection({ rabbitMQConfig: new RabbitMQConfig(ora) });
            await rabbitMQConnection.connect();

            const rabbitMQConfigurer = new RabbitMQConfigurer(rabbitMQConnection);
            await rabbitMQConfigurer.configure();

            const consumer = new Consumer({ rabbitMQConnection, messageHandler, limit: parsedLimit });
            consumer.init();
        } catch (error) {
            console.log("Message handling failed", error.message);
            process.exit(1);
        }
    });

process.on('uncaughtException', (err) => {
    console.log('uncaught exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('unhandledRejection', reason);
});

program.parse(process.argv);
