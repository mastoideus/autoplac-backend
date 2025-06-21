import HttpError from "../HttpError.js";

export function validateWithZod(zodSchema, data) {
  const result = zodSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
