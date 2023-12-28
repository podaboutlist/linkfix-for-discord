import { CustomCommand } from "../../@types/CustomCommand";
import { SlashCommandBuilder } from "discord.js";

const commandData = new SlashCommandBuilder()
  .setName("configure")
  .addBooleanOption((option) =>
    option
      .setName("delete_on_reply")
      .setDescription("Should LinkFix delete messages when it replies to them?"),
  )
  .addBooleanOption((option) =>
    option
      .setName("mention_user")
      .setDescription(
        "Mention the user LinkFix is replying to (when deleting a message).",
      ),
  )
  .addBooleanOption((option) =>
    option
      .setName("fix_instagram")
      .setDescription("Enable/disable fixing of Instagram URLs."),
  )
  .addBooleanOption((option) =>
    option
      .setName("fix_reddit")
      .setDescription("Enable/disable fixing of Reddit URLs."),
  )
  .addBooleanOption((option) =>
    option
      .setName("fix_tiktok")
      .setDescription("Enable/disable fixing of TikTok URLs."),
  )
  .addBooleanOption((option) =>
    option
      .setName("fix_twitter")
      .setDescription("Enable/disable fixing of Twitter/X URLs."),
  )
  .addBooleanOption((option) =>
    option
      .setName("fix_youtube")
      .setDescription("Enable/disable fixing of YouTube Shorts URLs."),
  )
  // run SetDescription last becasue add...Option functions don't return a
  // SlashCommandBuilder
  .setDescription("Configure how LinkFix behaves in your server.");

export const ConfigureCommand: CustomCommand = {
  data: commandData,
  execute: async (i, pool) => {
    // FIXME: "Property 'getBoolean' does not exist on type 'Omit<CommandInteractionOptionResolver"
    //const deleteOnReply = i.options.get("delete_on_reply")?.value;

    if (typeof pool === "undefined") {
      await i.reply({
        content: "Error: database pool is undefined.",
        ephemeral: false,
      });
      return;
    }

    let guildId: string | bigint | null = i.guildId;

    if (guildId === null) {
      await i.reply({
        content: "Error: `interaction.guildId` is `null`.",
        ephemeral: false,
      });
      return;
    }

    guildId = BigInt(guildId);

    const poolClient = await pool.connect();

    let queryData = await poolClient.query(
      "SELECT * FROM guilds WHERE native_guild_id = $1",
      [i.guildId],
    );
    let inserting = false;

    // Add server to database if it does not already exist
    if (queryData.rowCount === null || queryData.rowCount < 1) {
      inserting = true;

      queryData = await poolClient.query(
        "INSERT INTO guilds(id, native_guild_id) VALUES(default,$1) RETURNING *",
        [guildId],
      );

      // Error adding server to the database
      if (queryData.rowCount === null || queryData.rowCount < 1) {
        await i.reply({
          content: "Error inserting guild into database!",
          ephemeral: false,
        });

        poolClient.release();

        return;
      }
    }

    const row = <{ id: number; native_guild_id: string }>queryData.rows[0];

    // man oh man did prettier make this ugly lol
    await i.reply({
      content: `Your guild was ${
        inserting ? "inserted into" : "found in"
      } the database: \n\`\`\`\n{ id: ${row.id}, native_guild_id: ${
        row.native_guild_id
      } }\n\`\`\``,
      ephemeral: false,
    });

    poolClient.release();

    return;
  },
};
