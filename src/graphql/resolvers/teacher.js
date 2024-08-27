import moment from "moment";

export default {
  Query: {
    getAllTeacher: async (_, { search }, { models }) => {
      const options = search?.options ?? null;
      //PRIORITARIO arreglar consulta para que busque las options y filter y segun eso haga las busquedas
      const optionsFind = {};

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

      const listTeacher = await models.Teacher.findAll(optionsFind);

      const infoPage = {
        count: listTeacher.length,
        pages: 1,
        current: 1,
        next: false,
        prev: false,
      };

      return {
        infoPage,
        results: listTeacher,
      };
    },
    getAllIdTeacher: async (_, _args, { models }) => {
      const listTeacher = await models.Teacher.findAll();

      const listId = listTeacher.map((t) => t.id);

      return listId;
    },
    getDataTeacherById: async (_, { id }, { models }) => {
      const optionsFind = {};

      const findTeacher = await models.Teacher.findByPk(id, optionsFind);

      return findTeacher;
    },
  },
  Mutation: {
    createTeacher: async (_, { input }, { models }) => {
      const { id } = input;

      if (id) {
        const findTeacher = await models.Teacher.findByPk(id);
        if (!findTeacher) {
          throw new Error("error");
        }

        if (findTeacher.active === false) {
          throw new Error("Usuario suspendido no puede ser modificado");
        }

        try {
          const result = await models.sequelizeInst.transaction(async (t) => {
            const upTeacher = {
              ...input,
            };

            await models.Teacher.update(
              { ...upTeacher },
              {
                where: {
                  id: id,
                },
                transaction: t,
              }
            );

            return true;
          });

          return result;
        } catch (error) {
          throw new Error("error");
        }
      } else {
        try {
          const result = await models.sequelizeInst.transaction(async (t) => {
            const inpTeacher = {
              ...input,
            };

            const teacher = await models.Teacher.create(
              {
                ...inpTeacher,
              },
              { transaction: t }
            );

            return true;
          });

          return result;
        } catch (error) {
          // PRIORITARIO Create error manager to handle internal messages or retries or others
          throw new Error("error");
        }
      }
    },
    markAttendanceTeacher: async (_, { input }, { models }) => {
      const { codeQr, typeMark } = input;
      try {
        const findTeacher = await models.Teacher.findOne({
          where: {
            codeQr,
            active: true,
          },
        });

        if (!findTeacher) {
          throw new Error("1");
        }

        const timeMark = moment().format("HH:mm");
        const dayMark = moment().format("YYYY-MM-DD");
        let idAtt = undefined;

        if (typeMark === "OUT") {
          const findAtt = await models.Attendance.findOne({
            where: {
              teacherId: findTeacher.id,
              day: moment().format("YYYY-MM-DD"),
            },
          });

          if (findAtt) {
            idAtt = findAtt;
          }
        }

        let result = undefined;
        let attendance = {};
        if (idAtt === undefined) {
          result = await models.sequelizeInst.transaction(async (t) => {
            const inpAtt = {
              teacherId: findTeacher.id,
              in: timeMark,
              day: dayMark,
            };

            attendance = await models.Attendance.create(
              {
                ...inpAtt,
              },
              {
                transaction: t,
              }
            );

            attendance.Teacher = findTeacher;

            return attendance;
          });
        } else {
          if (idAtt.out !== null) {
            throw new Error("2");
          }
          result = await models.sequelizeInst.transaction(async (t) => {
            attendance = await models.Attendance.findByPk(idAtt.id);
            attendance.out = timeMark;
            await attendance.save({ transaction: t });

            attendance.Teacher = findTeacher;

            return attendance;
          });
        }

        return result;
      } catch (error) {
        // PRIORITARIO Create error manager to handle internal messages or retries or others

        if (error.message === "1") {
          throw new Error("No se encuentra el usuario");
        }
        if (error.message === "2") {
          throw new Error("Salida ya registrada con aterioridad");
        }
        throw new Error("error");
      }
    },
    deleteTeacherById: async (_, { id }, { models }) => {
      try {
        const result = await models.sequelizeInst.transaction(async (t) => {
          const findAtt = await models.Attendance.findOne({
            where: {
              teacherId: id,
            },
          });

          if (findAtt) {
            throw new Error("1");
          }

          await models.Teacher.destroy({
            where: {
              id: id,
            },
            transaction: t,
          });

          return true;
        });

        return result;
      } catch (error) {
        // PRIORITARIO Create error manager to handle internal messages or retries or others

        if (error.message === "1") {
          throw new Error("Usuario ya tiene registro almacenado");
        }
        throw new Error("error");
      }
    },
    disableTeacherById: async (_, { id }, { models }) => {
      try {
        const result = await models.sequelizeInst.transaction(async (t) => {
          await models.Teacher.update(
            {
              active: false,
            },
            {
              where: {
                id: id,
              },
              transaction: t,
            }
          );

          return true;
        });

        return result;
      } catch (error) {
        // PRIORITARIO Create error manager to handle internal messages or retries or others

        throw new Error("error");
      }
    },
  },
};
