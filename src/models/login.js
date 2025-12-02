import { DataTypes } from "sequelize";

const loginModel = (sequelize) => {
  const Login = sequelize.define("Login", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Por favor insira um email válido",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });
  return Login;
};

export default loginModel;
