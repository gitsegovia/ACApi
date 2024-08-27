import moment from "moment";

export default {
  Query: {
    getAllWorker: async (_, { search }, { models }) => {
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

      const listWorker = await models.Worker.findAll(optionsFind);

      const infoPage = {
        count: listWorker.length,
        pages: 1,
        current: 1,
        next: false,
        prev: false,
      };

      return {
        infoPage,
        results: listWorker,
      };
    },
    getAllIdWorker: async (_, _args, { models }) => {
      const listWorker = await models.Worker.findAll();

      const listId = listWorker.map((t) => t.id);

      return listId;
    },
    getDataWorkerById: async (_, { id }, { models }) => {
      const optionsFind = {};

      const findWorker = await models.Worker.findByPk(id, optionsFind);

      return findWorker;
    },
  },
  Mutation: {
    createWorker: async (_, { input }, { models }) => {
      const { id } = input;

      if (id) {
        const findWorker = await models.Worker.findByPk(id);
        if (!findWorker) {
          throw new Error("error");
        }

        if (findWorker.active === false) {
          throw new Error("Usuario suspendido no puede ser modificado");
        }

        try {
          const result = await models.sequelizeInst.transaction(async (t) => {
            const upWorker = {
              ...input,
            };

            await models.Worker.update(
              { ...upWorker },
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
            const inpWorker = {
              ...input,
            };

            const worker = await models.Worker.create(
              {
                ...inpWorker,
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
    markAttendanceWorker: async (_, { input }, { models }) => {
      const { codeQr, typeMark } = input;
      try {
        const findWorker = await models.Worker.findOne({
          where: {
            codeQr,
            active: true,
          },
        });

        if (!findWorker) {
          throw new Error("1");
        }

        const timeMark = moment().format("HH:mm");
        const dayMark = moment().format("YYYY-MM-DD");
        let idAtt = undefined;

        if (typeMark === "OUT") {
          const findAtt = await models.Attendance.findOne({
            where: {
              workerId: findWorker.id,
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
              workerId: findWorker.id,
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

            attendance.Worker = findWorker;

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

            attendance.Worker = findWorker;
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
    deleteWorkerById: async (_, { id }, { models }) => {
      try {
        const result = await models.sequelizeInst.transaction(async (t) => {
          const findAtt = await models.Attendance.findOne({
            where: {
              workerId: id,
            },
          });

          if (findAtt) {
            throw new Error("1");
          }

          await models.Worker.destroy({
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
    disableWorkerById: async (_, { id }, { models }) => {
      try {
        const result = await models.sequelizeInst.transaction(async (t) => {
          await models.Worker.update(
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
