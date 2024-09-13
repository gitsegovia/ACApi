import moment from "moment-timezone";

export default {
  Query: {
    getAllAdministrative: async (_, { search }, { models }) => {
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

      const listAdministrative = await models.Administrative.findAll(
        optionsFind
      );

      const infoPage = {
        count: listAdministrative.length,
        pages: 1,
        current: 1,
        next: false,
        prev: false,
      };

      return {
        infoPage,
        results: listAdministrative,
      };
    },
    getAllIdAdministrative: async (_, _args, { models }) => {
      const listAdministrative = await models.Administrative.findAll();

      const listId = listAdministrative.map((t) => t.id);

      return listId;
    },
    getDataAdministrativeById: async (_, { id }, { models }) => {
      const optionsFind = {};

      const findAdministrative = await models.Administrative.findByPk(
        id,
        optionsFind
      );

      return findAdministrative;
    },
  },
  Mutation: {
    createAdministrative: async (_, { input }, { models }) => {
      const { id } = input;

      if (id) {
        const findAdministrative = await models.Administrative.findByPk(id);
        if (!findAdministrative) {
          throw new Error("error");
        }

        if (findAdministrative.active === false) {
          throw new Error("Usuario suspendido no puede ser modificado");
        }

        try {
          const result = await models.sequelizeInst.transaction(async (t) => {
            const upAdministrative = {
              ...input,
            };

            await models.Administrative.update(
              { ...upAdministrative },
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
            const inpAdministrative = {
              ...input,
            };

            const administrative = await models.Administrative.create(
              {
                ...inpAdministrative,
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
    markAttendanceAdministrative: async (_, { input }, { models }) => {
      const { codeQr, typeMark, dependence } = input;
      try {
        const findAdministrative = await models.Administrative.findOne({
          where: {
            idnDni: codeQr,
            active: true,
          },
        });

        if (!findAdministrative) {
          throw new Error("1");
        }

        const timeMark = moment().tz("America/Caracas").format("HH:mm");
        const dayMark = moment().tz("America/Caracas").format("YYYY-MM-DD");
        let idAtt = undefined;

        if (typeMark === "OUT") {
          const findAtt = await models.Attendance.findOne({
            where: {
              administrativeId: findAdministrative.id,
              day: moment().tz("America/Caracas").format("YYYY-MM-DD"),
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
              administrativeId: findAdministrative.id,
              in: timeMark,
              day: dayMark,
            };
            await models.Attendance.create(
              {
                ...inpAtt,
              },
              {
                transaction: t,
              }
            );

            attendance.Administrative = findAdministrative;

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

            attendance.Administrative = findAdministrative;
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
    deleteAdministrativeById: async (_, { id }, { models }) => {
      try {
        const result = await models.sequelizeInst.transaction(async (t) => {
          const findAtt = await models.Attendance.findOne({
            where: {
              administrativeId: id,
            },
          });

          if (findAtt) {
            throw new Error("1");
          }

          await models.Administrative.destroy({
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
    disableAdministrativeById: async (_, { id }, { models }) => {
      try {
        const result = await models.sequelizeInst.transaction(async (t) => {
          await models.Administrative.update(
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
