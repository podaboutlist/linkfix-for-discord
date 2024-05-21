export type EnvironmentMode = "production" | "development";

export function getEnvironmentMode(): EnvironmentMode {
  const debugFlag = process.env.LINKFIX_DEBUG ?? "0";
  const isDebugMode = debugFlag !== "0";

  if (isDebugMode) {
    return "development";
  } else {
    return "production";
  }
}
