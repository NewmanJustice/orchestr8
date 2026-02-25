/**
 * Tool Input Validation Utilities
 * Validates inputs against tool schema constraints
 */

/**
 * Validate tool input against a schema
 * @param {Object} schema - Tool schema with input_schema
 * @param {Object} input - Input to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateToolInput(schema, input) {
  const errors = [];
  const props = schema.input_schema.properties;
  const required = schema.input_schema.required || [];

  // Check required fields
  for (const field of required) {
    if (!(field in input)) {
      errors.push(`missing required field: ${field}`);
    }
  }

  // Validate each field
  for (const [key, value] of Object.entries(input)) {
    const propSchema = props[key];
    if (!propSchema) continue;

    // Type: number with bounds
    if (propSchema.type === 'number') {
      if (typeof value !== 'number') {
        errors.push(`${key} must be number`);
      } else {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push(`${key} below minimum ${propSchema.minimum}`);
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push(`${key} above maximum ${propSchema.maximum}`);
        }
      }
    }

    // Type: array
    if (propSchema.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${key} must be array`);
      }
    }

    // Type: string with maxLength
    if (propSchema.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`${key} must be string`);
      } else if (propSchema.maxLength && value.length > propSchema.maxLength) {
        errors.push(`${key} exceeds maxLength ${propSchema.maxLength}`);
      }
    }

    // Enum constraint
    if (propSchema.enum && !propSchema.enum.includes(value)) {
      errors.push(`${key} must be one of: ${propSchema.enum.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalize feedback input to handle "rec" shorthand for "recommendation"
 * @param {Object} input - Raw feedback input
 * @returns {Object} - Normalized input
 */
function normalizeFeedbackInput(input) {
  if (input.rec && !input.recommendation) {
    return { ...input, recommendation: input.rec };
  }
  return input;
}

module.exports = {
  validateToolInput,
  normalizeFeedbackInput
};
