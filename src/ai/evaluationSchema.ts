export const AI_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    accuracy: {
      type: "integer",
      enum: [1, 2, 3, 4, 5],
      description: "Accuracy score from 1 (incorrect) to 5 (fully correct).",
    },
    fluency: {
      type: "integer",
      enum: [1, 2, 3, 4, 5],
      description: "Fluency score from 1 (poor) to 5 (excellent).",
    },
    style: {
      type: "integer",
      enum: [1, 2, 3, 4, 5],
      description: "Style score from 1 (poor) to 5 (excellent).",
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["accuracy", "fluency", "style", "terminology", "other"],
          },
          description: {
            type: "string",
          },
        },
        required: ["category", "description"],
        additionalProperties: false,
      },
    },
  },
  required: ["accuracy", "fluency", "style", "issues"],
  additionalProperties: false,
} as const;
