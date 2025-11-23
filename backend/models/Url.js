const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Url = sequelize.define("Url", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    originalUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    shortId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    customAlias: {
        type: DataTypes.STRING,
        unique: true,
        sparse: true,
        defaultValue: null,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id",
        },
        defaultValue: null,
    },
    email: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expiresAt: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    deletedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    clickHistory: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
}, {
    timestamps: false,
    tableName: "urls",
});

// Association
Url.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Url, { foreignKey: "userId" });

module.exports = Url;