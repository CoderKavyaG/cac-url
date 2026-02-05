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
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: "id",
        },
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
        defaultValue: null,
        get() {
            const value = this.getDataValue('clickHistory');
            return Array.isArray(value) ? value : [];
        }
    },
}, {
    timestamps: false,
    tableName: "urls",
});

// Association
Url.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Url, { foreignKey: "userId" });

module.exports = Url;