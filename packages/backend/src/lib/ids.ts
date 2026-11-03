import { z } from "zod";

// Every id column is a Postgres `integer`. A larger value can't match a row,
// and Prisma throws on it instead of returning nothing.
const INT4_MAX = 2_147_483_647;

export const dbIdSchema = z.number().int().positive().max(INT4_MAX);

/** For `/:id` route params, which arrive as strings. */
export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive().max(INT4_MAX),
});
