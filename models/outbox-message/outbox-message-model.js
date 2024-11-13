'use strict';
const { Model } = require('sequelize');
const { OutBoxStatus } = require('./outbox-status');
module.exports = (sequelize, DataTypes) => {

  class OutboxMessage extends Model {
  
    async markAsSent() {
      this.status = OutBoxStatus.ENUM.SENT_STATUS;
      this.sent_at = new Date();
    }

    getMessageId() {
      return this.get().message_id;
    }

    getProperties() {
      const outbox_message = this.get();
      return {
        ...outbox_message.properties,
        headers: outbox_message.headers
      };
    }

    getBody() {
      const outbox_message = this.get();
      return outbox_message.body;
    }
  }
  OutboxMessage.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    message_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Message Id is required.",
        },
      },
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Type is required.",
        },
        notEmpty: {
          msg: "Type cannot be empty.",
        },
      },
    },
    headers: {
      type: DataTypes.JSON,
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Properties is required.",
        }
      }
    },
    body: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Body is required.",
        }
      }
    },
    status: {
      type: DataTypes.ENUM(OutBoxStatus.getValues()),
      allowNull: false,
      defaultValue: OutBoxStatus.ENUM.PENDING_STATUS,
      validate: {
        isIn: {
          args: [OutBoxStatus.getValues()],
          msg: 'Invalid status value.',
        },
      },
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Invalid sent_at value.'
        }
      }
    },
  }, {
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    modelName: 'outbox_message',
    tableName: 'outbox_message',
  });

  return OutboxMessage;
};