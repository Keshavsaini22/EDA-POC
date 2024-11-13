const { sequelize } = require('../config').dbConnection;

exports.BaseRepository = class BaseRepository {
  constructor({ dbConnection, model }) {
    this.dbConnection = dbConnection;
    this.model = model;
  }

  async create(payload, options = {}) {
    const instance = await this.model.create(payload, options);
    return  instance && instance?.toJSON();
  }

  async update(criteria, payload, fields, transaction) {

    const options = {
      where: criteria,
      returning: fields
    }

    if (transaction) {
      options.transaction = transaction
    }

    const [updatedRowCount, updatedRows] = await this.model.update(payload, options);
    return { updated_row_count: updatedRowCount, updated_rows: updatedRows };
  }


  async count(payload) {
    return await this.model.count(payload);
  }
  async getAll() {
    return await this.model.findAll();
  }

  findById(id) {
    return this.items.find(item => item.id === id);
  }

  async findOne(criteria, include = [], attributes = {}, transaction = null) {
    return await this.model.findOne({
      where: criteria,
      include,
      attributes,
      transaction,
    });
  }

  async findAll({ criteria, include = [], order, attributes = {}, offset = 0, paranoid = true }) {
    return await this.model.findAll({
      where: criteria,
      include,
      attributes,
      offset,
      order,
      paranoid,
    });
  }

  async findAndCountAll({ criteria, include = [], order, attributes = {}, offset = 0, limit = 10 }) {
    return await this.model.findAndCountAll({
      where: criteria,
      include,
      attributes,
      offset,
      order,
      limit,
    });
  }


  async createBulk(payload, options) {
    return await this.model.bulkCreate(payload, options);
  }

  async softDelete(criteria) {
    const response = await this.model.destroy({
      where: criteria
    });
    return response;
  }

  async handleManagedTransaction(callback) {
    return await sequelize.transaction(callback);
  }

  scope(args){
    return this.model.scope(args);
  }
}
