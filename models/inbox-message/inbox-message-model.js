//add improvement by adding indexing in the table for fast searching and move the logic of unique constraint to the indexing part like we did in the conversation table of Complaints

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class InboxMessage extends Model { }

    InboxMessage.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        message_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: "unique_index",
            validate: {
                notNull: {
                    msg: "Message ID is required."
                },
                notEmpty: {
                    msg: "Message ID is required."
                }
            }
        },
        handler_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "unique_index",
            validate: {
                notNull: {
                    msg: "Handler name is required."
                },
                notEmpty: {
                    msg: "Handler name is required."
                },
            }
        },
    }, {
        sequelize,
        timestamps: true,
        underscored: true,
        tableName: "inbox_message",
        modelName: "inbox_message",
        createdAt: "handled_at",
        updatedAt: false,
        indexes: [
            {
                name: "unique_index",
                unique: true,
                fields: ["message_id", "handler_name"]
            }
        ],
    });

    return InboxMessage;
};