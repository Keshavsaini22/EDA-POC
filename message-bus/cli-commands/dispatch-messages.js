require("dotenv").config();
const { Command } = require("commander");
const ora = require('ora-classic');
const { dbConnection } = require("../../config");
const { RabbitMQConnection } = require("../rabbitmq/rabbitmq-connection");
const { RabbitMQConfigurer } = require("../rabbitmq/rabbitmq-configurer");
const { RabbitMQConfig } = require("../rabbitmq/rabbitmq-config");
const OutboxMessageRelay = require("../outbox-message-relay");
const Producer = require("../workers/producer");
const { outboxMessageRepository } = require('../../repositories');

const program = new Command();

program
    .name("dispatch-messages")
    .option("-l, --limit <limit>", "Number of messages to dispatch", process.env.DISPATCH_MESSAGE_LIMIT || 10)
    .description("Dispatch messages with an optional limit")
    .action(async ({ limit }) => {
        try {
            const parsedLimit = parseInt(limit);
            if (isNaN(parsedLimit)) throw new Error(`TypeError: Option 'limit' is the wrong type,must be an integer got:${limit}`);
            console.log(`Dispatching messages with limit: ${parsedLimit}`);

            await dbConnection.checkConnection();

            const rabbitMQConnection = new RabbitMQConnection({ rabbitMQConfig: new RabbitMQConfig(ora), reconnectPolicy: true });
            await rabbitMQConnection.connect();

            const rabbitMQConfigurer = new RabbitMQConfigurer(rabbitMQConnection);
            await rabbitMQConfigurer.configure();

            const outboxMessageRelay = new OutboxMessageRelay({ producer: new Producer({ rabbitMQConnection, rabbitMQConfigurer }), outboxMessageRepository });
            await outboxMessageRelay.execute(parsedLimit);

            process.exit(0);
        } catch (error) {
            console.log("Error occurred during message dispatch: ", error.message);
            process.exit(1);
        }
    })

process.on('uncaughtException', (err) => {
    console.log('uncaught exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('unhandledRejection', reason);
});

program.parse(process.argv);