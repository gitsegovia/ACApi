import { Model, UUID, UUIDV4, DECIMAL, TIME, DATEONLY } from "sequelize";

const createModel = (sequelize) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Teacher, {
        foreignKey: {
          name: "teacherId",
          field: "teacherId",
        },
        as: "Teacher",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Attendance.belongsTo(models.Worker, {
        foreignKey: {
          name: "workerId",
          field: "workerId",
        },
        as: "Worker",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Attendance.belongsTo(models.Administrative, {
        foreignKey: {
          name: "administrativeId",
          field: "administrativeId",
        },
        as: "Administrative",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Attendance.init(
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: UUID,
        defaultValue: UUIDV4,
      },
      in: {
        allowNull: false,
        type: TIME,
      },
      out: {
        allowNull: true,
        type: TIME,
      },
      hourWork: {
        allowNull: true,
        type: DECIMAL,
      },
      day: {
        allowNull: false,
        type: DATEONLY,
      },
    },
    {
      sequelize,
      modelName: "Attendance",
    }
  );
  return Attendance;
};

export default createModel;
