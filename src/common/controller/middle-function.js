const validator = require("../../shared/validator");
module.exports = async (
  mainParametr,
  service,
  payload,
  status,
  schema = false,
  schemaParams
) => {
  try {
    if (schema) {
      validator(schemaParams, schema);
    }
    const result = await service(payload);
    return mainParametr.res.status(status).json({ data: result });
  } catch (error) {
    return mainParametr.next(error);
  }
};
