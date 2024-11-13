'use strict';
const { OutBoxStatus } = require('../models/outbox-message/outbox-status');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('outbox_message', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      headers: {
        type: Sequelize.JSON,
      },
      properties: {
        type: Sequelize.JSON,
        allowNull: false
      },
      body: {
        type: Sequelize.JSON,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(OutBoxStatus.getValues()),
        allowNull: false,
        defaultValue: OutBoxStatus.ENUM.PENDING_STATUS
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('outbox_message');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_outbox_message_status"');
  }
};
