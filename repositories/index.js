module.exports = {
    baseRepository: require("./base-repository.js").BaseRepository,
    userRepository: require("./user-repository.js").userRepository,
    outboxMessageRepository: require('./outbox-message-repository.js').outboxMessageRepository,
    inboxMessageRepository: require('./inbox-message-repository.js').inboxMessageRepository,
}