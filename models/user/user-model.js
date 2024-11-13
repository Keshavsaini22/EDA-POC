'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      // define association here
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING
    },
    rating: {
      type: DataTypes.INTEGER
    },
    email: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "user",
    modelName: "user",
  });
  return User;
};