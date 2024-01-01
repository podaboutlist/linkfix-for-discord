import fs from "node:fs";

/**
 * Check for the presence of `varName` or `varName_FILE` keys in the environment.
 * If `varName` exists, return its content. If `varName_FILE` exits, read the content
 * of the file path.
 * @param varName Name of the variable to check for defenition/file pointer in environment.
 * @returns Contents of `varName` environment variable or `varName_FILE` file contents.
 */
const getFromEnvOrFile: (varName: string) => string = (varName) => {
  const varEnv = process.env[varName];
  const varFile = process.env[varName + "_FILE"];

  if (typeof varEnv === "undefined" && typeof varFile === "undefined") {
    throw Error(
      `[getFromEnvOrFile]\t${varName} and ${varName}_FILE environment variables are both undefined!`,
    );
  }

  if (varEnv) {
    console.debug(`[getFromEnvOrFile]\t${varName} found in environment.`);
    return varEnv;
  }

  console.debug(`[getFromEnvOrFile]\tAttempting to read contents of ${varFile}.`);

  let fileContents = "";

  try {
    // Still have to cast varFile even though it's 100% defined at this point
    fileContents = fs.readFileSync(<string>varFile, { encoding: "utf8" });
  } catch (err) {
    throw Error(`[getFromEnvOrFile]\tError reading ${varFile}:\n` + (<Error>err).message);
  }

  console.debug(`[getFromEnvOrFile]\t${varFile} contents read successfully.`);
  // I don't think removing newlines will ever be an issue. If it is, you can get mad at me.
  return fileContents.replaceAll(/\r?\n/g, "");
};

export default getFromEnvOrFile;
