const { sequelize } = require('../config').dbConnection;
const { BaseRepository } = require('./base-repository');
const db = require("../models");

class UserRepository extends BaseRepository {

    async registerUser(payload,transaction) {
        const result = await this.create(payload,transaction);
        return result
    }
}

module.exports = {
    userRepository: new UserRepository({
        dbConnection: sequelize,
        model: db['user'],
    }),
};