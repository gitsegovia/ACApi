import moment from "moment";
import { Op } from "sequelize";

export default {
  Query: {
    getAllAttendance: async (_, { search }, { models }) => {
      const options = search?.options ?? null;
      const dateStart = search?.dateStart ?? null;
      const dateEnd = search?.dateEnd ?? null;
      //PRIORITARIO arreglar consulta para que busque las options y filter y segun eso haga las busquedas

      const dayStart =
        dateStart !== null
          ? moment(dateStart).startOf("day").format("YYYY-MM-DD HH:mm:ss")
          : moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
      const dayEnd =
        dateEnd !== null
          ? moment(dateEnd).endOf("day").format("YYYY-MM-DD HH:mm:ss")
          : moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");

      const optionsFind = {
        where: {
          updatedAt: {
            [Op.gte]: dayStart,
            [Op.lte]: dayEnd,
          },
        },
        include: [
          { model: models.Teacher, as: "Teacher" },
          { model: models.Worker, as: "Worker" },
          { model: models.Administrative, as: "Administrative" },
        ],
      };

      if (options !== null) {
        if (options.limit > 0) {
          optionsFind.limit = options.limit;
        }
        if (options.offset > 0) {
          optionsFind.offset = options.offset;
        }
        if (options.orderBy) {
          optionsFind.order = options.orderBy.map((field, index) => {
            return [
              field,
              options.direction ? options.direction[index] ?? "ASC" : "ASC",
            ];
          });
          optionsFind.include.order = optionsFind.order;
        }
      }

      const listAttendance = await models.Attendance.findAll(optionsFind);

      const infoPage = {
        count: listAttendance.length,
        pages: 1,
        current: 1,
        next: false,
        prev: false,
      };

      return {
        infoPage,
        results: listAttendance,
      };
    },
    getAttendanceToDay: async (_, _arg, { models }) => {
      //PRIORITARIO arreglar consulta para que busque las options y filter y segun eso haga las busquedas
      const optionsFind = {
        where: {
          updatedAt: {
            [Op.gte]: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
            [Op.lte]: moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
          },
        },
        include: [
          { model: models.Teacher, as: "Teacher" },
          { model: models.Worker, as: "Worker" },
          { model: models.Administrative, as: "Administrative" },
        ],
      };

      const listAttendance = await models.Attendance.findAll(optionsFind);

      return listAttendance;
    },
    getAttendanceToWeek: async (_, _arg, { models }) => {
      //PRIORITARIO arreglar consulta para que busque las options y filter y segun eso haga las busquedas
      const optionsFind = {
        where: {
          updatedAt: {
            [Op.gte]: moment().startOf("week").format("YYYY-MM-DD HH:mm:ss"),
            [Op.lte]: moment().endOf("week").format("YYYY-MM-DD HH:mm:ss"),
          },
        },
        include: [
          { model: models.Teacher, as: "Teacher" },
          { model: models.Worker, as: "Worker" },
          { model: models.Administrative, as: "Administrative" },
        ],
      };

      const listAttendance = await models.Attendance.findAll(optionsFind);

      return listAttendance;
    },
  },
  Mutation: {},
};
