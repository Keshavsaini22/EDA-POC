"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("inbox_message", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      handler_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        field: "handled_at",
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    }, {
      uniqueKeys: {
        unique_index: {
          fields: ["message_id", "handler_name"]
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("inbox_message");
  }
};