import { Message } from "discord.js";
import { debug } from "../logging";

export interface FallbackReplacementConfig {
  timeoutMs: number;
  maxRetries: number;
  checkEmbeds: boolean;
}

export class FallbackReplacement {
  private config: FallbackReplacementConfig;
  private replacements: string[];
  private currentIndex: number = 0;

  constructor(
    replacements: string[],
    config: Partial<FallbackReplacementConfig> = {}
  ) {
    this.replacements = replacements;
    this.config = {
      timeoutMs: config.timeoutMs || 10000, // 10 seconds default
      maxRetries: config.maxRetries || 3,
      checkEmbeds: config.checkEmbeds !== false, // true by default
    };
  }

  /**
   * Get the current replacement URL
   */
  public getCurrentReplacement(): string {
    return this.replacements[this.currentIndex] || this.replacements[0];
  }

  /**
   * Check if there are more replacements to try
   */
  public hasMoreReplacements(): boolean {
    return this.currentIndex < this.replacements.length - 1;
  }

  /**
   * Move to the next replacement
   */
  public nextReplacement(): boolean {
    if (this.hasMoreReplacements()) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  /**
   * Reset to the first replacement
   */
  public resetReplacement(): void {
    this.currentIndex = 0;
  }

  /**
   * Get all possible replacements
   */
  public getAllReplacements(): string[] {
    return [...this.replacements];
  }

  /**
   * Check if a message has embeds
   */
  private async checkForEmbeds(message: Message): Promise<boolean> {
    try {
      // Wait longer for Discord to process the message and potentially add embeds
      // Instagram embeds can take 5-10 seconds to appear
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Fetch the message again to get the latest state
      const fetchedMessage = await message.channel.messages.fetch(message.id);

      // Check if the message has embeds (any type of embed indicates success)
      const hasEmbeds = fetchedMessage.embeds.length > 0;

      if (process.env.LINKFIX_DEBUG) {
        debug(`checkForEmbeds: ${hasEmbeds} (${fetchedMessage.embeds.length} embeds) after 8s wait`, "FallbackReplacement");
      }

      // If no embeds yet, wait a bit more and check again
      if (!hasEmbeds) {
        if (process.env.LINKFIX_DEBUG) {
          debug(`No embeds found, waiting additional 5 seconds...`, "FallbackReplacement");
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const secondCheck = await message.channel.messages.fetch(message.id);
        const hasEmbedsSecondCheck = secondCheck.embeds.length > 0;
        
        if (process.env.LINKFIX_DEBUG) {
          debug(`Second check - embeds: ${hasEmbedsSecondCheck} (${secondCheck.embeds.length} embeds)`, "FallbackReplacement");
        }
        
        return hasEmbedsSecondCheck;
      }

      return hasEmbeds;
    } catch (error) {
      if (process.env.LINKFIX_DEBUG) {
        debug(`Error checking for embeds: ${error}`, "FallbackReplacement");
      }
      return false;
    }
  }

  /**
   * Try the current replacement and check if it works
   */
  public async tryCurrentReplacement(
    originalMessage: Message,
    replacementFunction: (url: string) => string,
    existingReplyMessage?: Message
  ): Promise<{ success: boolean; replacement: string; replyMessage: Message | null }> {
    const currentUrl = this.getCurrentReplacement();
    const replacement = replacementFunction(currentUrl);

    if (process.env.LINKFIX_DEBUG) {
      debug(`Trying replacement ${this.currentIndex + 1}/${this.replacements.length}: ${currentUrl}`, "FallbackReplacement");
    }

    // If we don't need to check embeds, just return success
    if (!this.config.checkEmbeds) {
      return { success: true, replacement, replyMessage: null };
    }

    let replyMessage: Message;

    try {
      if (existingReplyMessage) {
        // Edit the existing message instead of creating a new one
        if (process.env.LINKFIX_DEBUG) {
          debug(`Editing existing message with: ${currentUrl}`, "FallbackReplacement");
        }
        replyMessage = await existingReplyMessage.edit({
          content: replacement,
          allowedMentions: { repliedUser: false }
        });
      } else {
        // Send the initial replacement message
        if (process.env.LINKFIX_DEBUG) {
          debug(`Sending initial message with: ${currentUrl}`, "FallbackReplacement");
        }
        replyMessage = await originalMessage.reply({
          content: replacement,
          allowedMentions: { repliedUser: false }
        });
      }

      // Check if embeds were generated
      const hasEmbeds = await this.checkForEmbeds(replyMessage);

      if (hasEmbeds) {
        if (process.env.LINKFIX_DEBUG) {
          debug(`Replacement successful with embeds: ${currentUrl}`, "FallbackReplacement");
        }
        return { success: true, replacement, replyMessage };
      } else {
        if (process.env.LINKFIX_DEBUG) {
          debug(`Replacement failed - no embeds: ${currentUrl}`, "FallbackReplacement");
        }
        return { success: false, replacement, replyMessage };
      }
    } catch (error) {
      if (process.env.LINKFIX_DEBUG) {
        debug(`Error sending/editing replacement message: ${error}`, "FallbackReplacement");
      }
      return { success: false, replacement, replyMessage: existingReplyMessage || null };
    }
  }

  /**
   * Try all replacements until one works or we run out
   */
  public async tryAllReplacements(
    originalMessage: Message,
    replacementFunction: (url: string) => string
  ): Promise<{ success: boolean; replacement: string; finalUrl: string }> {
    let attempts = 0;
    let replyMessage: Message | null = null;

    while (attempts < this.config.maxRetries && this.currentIndex < this.replacements.length) {
      attempts++;

      const result = await this.tryCurrentReplacement(originalMessage, replacementFunction, replyMessage || undefined);

      // Store the reply message for future edits
      if (result.replyMessage) {
        replyMessage = result.replyMessage;
      }

      if (result.success) {
        return {
          success: true,
          replacement: result.replacement,
          finalUrl: this.getCurrentReplacement()
        };
      }

      // Try next replacement if available
      if (this.hasMoreReplacements()) {
        this.nextReplacement();
        if (process.env.LINKFIX_DEBUG) {
          debug(`Moving to next replacement: ${this.getCurrentReplacement()}`, "FallbackReplacement");
        }
      } else {
        break;
      }
    }

    // If we get here, all replacements failed
    // Keep the last message that was tried (don't delete it)
    return {
      success: false,
      replacement: replacementFunction(this.getCurrentReplacement()),
      finalUrl: this.getCurrentReplacement()
    };
  }
}
