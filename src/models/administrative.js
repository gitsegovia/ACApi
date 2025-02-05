import {
  Model,
  UUID,
  UUIDV4,
  STRING,
  TEXT,
  DATEONLY,
  INTEGER,
  BOOLEAN,
} from "sequelize";
import { makeid } from "../utils/security";

const createModel = (sequelize) => {
  class Administrative extends Model {
    static associate(models) {
      Administrative.hasMany(models.Attendance, {
        foreignKey: {
          name: "administrativeId",
          field: "administrativeId",
        },
        as: "Attendance",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Administrative.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: UUID,
        defaultValue: UUIDV4,
      },
      firstName: {
        allowNull: false,
        type: STRING,
      },
      lastName: {
        allowNull: false,
        type: STRING,
      },
      typeDni: {
        allowNull: false,
        type: STRING,
        defaultValue: "dni",
      },
      idnDni: {
        allowNull: false,
        type: STRING,
      },
      gender: {
        allowNull: false,
        type: STRING,
      },
      birthDate: {
        allowNull: true,
        type: DATEONLY,
      },
      codeCountryPhone: {
        allowNull: false,
        type: STRING,
        defaultValue: "+58",
      },
      phone: {
        allowNull: false,
        type: STRING,
        defaultValue: "",
      },
      email: {
        allowNull: false,
        type: STRING,
        defaultValue: "",
      },
      address: {
        allowNull: true,
        type: TEXT,
      },
      position: {
        allowNull: false,
        type: STRING,
      },
      numberAdministrative: {
        allowNull: false,
        type: INTEGER,
        defaultValue: 0,
      },
      codeQr: {
        allowNull: false,
        type: STRING,
        defaultValue: "",
      },
      active: {
        allowNull: false,
        type: BOOLEAN,
        defaultValue: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (administrative) => {
          let valor = await Administrative.findAll({
            attributes: [
              [
                sequelize.fn("max", sequelize.col("numberAdministrative")),
                "maxNumber",
              ],
            ],
            raw: true,
          });
          let number = 1;
          if (valor && valor[0].maxNumber != null) {
            number += valor[0].maxNumber;
          }
          administrative.numberAdministrative = number;
          administrative.codeQr = `A-${number}-${makeid(12)}`;
        },
      },
      sequelize,
      modelName: "Administrative",
    }
  );
  return Administrative;
};

export default createModel;
