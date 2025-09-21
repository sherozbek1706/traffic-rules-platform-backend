const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");

function sanitize(str) {
  if (typeof str !== "string") return str;
  return sanitizeHtml(str, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "span",
      "strong",
      "em",
      "u",
      "i",
      "b",
      "code",
      "pre",
      "sub",
      "sup",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["style"],
    },
    allowedSchemes: ["data", "http", "https", "mailto"],
    parser: { lowerCaseTags: true },
  });
}

const optionSchema = Joi.object({
  id: Joi.number().integer().min(1).optional(),
  content: Joi.string().min(1).required(),
  is_correct: Joi.boolean().required(),
  explanation: Joi.string().allow(null, "").optional(),
});

const questionCreateSchema = Joi.object({
  content: Joi.string().min(1).required(),
  admin_id: Joi.number().integer().optional(),
  options: Joi.array().items(optionSchema).min(2).required(),
});

const questionUpdateSchema = Joi.object({
  content: Joi.string().min(1).required(),
  options: Joi.array().items(optionSchema).min(2).required(),
});

const optionOnlySchema = Joi.object({
  question_id: Joi.number().integer().min(1).required(),
  content: Joi.string().min(1).required(),
  is_correct: Joi.boolean().required(),
  explanation: Joi.string().allow(null, "").optional(),
});

const testCreateSchema = Joi.object({
  question_limit: Joi.number().integer().min(1).allow(null).optional(),
  randomize_questions: Joi.boolean().optional(),
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(null, "").optional(),
  time_limit_sec: Joi.number().integer().min(1).allow(null).optional(),
  admin_id: Joi.number().integer().optional(),
});

const testUpdateSchema = Joi.object({
  question_limit: Joi.number().integer().min(1).allow(null).optional(),
  randomize_questions: Joi.boolean().optional(),
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(null, "").optional(),
  time_limit_sec: Joi.number().integer().min(1).allow(null).optional(),
});

// ---- Recommendations ----
const recommendationCreateSchema = Joi.object({
  test_id: Joi.number().integer().required(),
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(null, ""),
  video_link: Joi.string().uri().allow(null, ""),
});

const recommendationUpdateSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(null, ""),
  video_link: Joi.string().uri().allow(null, ""),
});

module.exports = {
  sanitize,
  recommendationCreateSchema,
  recommendationUpdateSchema,
  optionSchema,
  optionOnlySchema,
  questionCreateSchema,
  questionUpdateSchema,
  testCreateSchema,
  testUpdateSchema,
};
