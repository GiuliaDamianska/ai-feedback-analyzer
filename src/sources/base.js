/**
 * Abstract base class for feedback data sources.
 *
 * Extend this to add new sources — CSV files, databases, APIs, webhooks, etc.
 * Only two things required: implement load() and override the name getter.
 *
 * Example:
 *   export class CsvSource extends FeedbackSource {
 *     constructor(filePath) { super(); this._path = filePath; }
 *     async load() { return parseCsv(this._path).map(r => r.text).join('\n'); }
 *     get name() { return `csv:${this._path}`; }
 *   }
 */
export class FeedbackSource {
  /**
   * Load and return the raw feedback text.
   * @returns {Promise<string>}
   */
  async load() {
    throw new Error(`${this.constructor.name} must implement load()`);
  }

  /**
   * Human-readable identifier for logging.
   * @returns {string}
   */
  get name() {
    throw new Error(`${this.constructor.name} must implement name getter`);
  }
}
