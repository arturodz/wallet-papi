/**
 * Feature-availability flags for optional integrations.
 *
 * Both keys are intentionally empty in local/dev and only set at deploy time, so
 * the document pipeline must degrade gracefully when either is missing. These are
 * SERVER-ONLY helpers — never call them from client components (they read
 * process.env). Pass their results into client components as props instead.
 */

export const aiEnabled = (): boolean => !!process.env.GEMINI_API_KEY;

export const blobEnabled = (): boolean => !!process.env.BLOB_READ_WRITE_TOKEN;
