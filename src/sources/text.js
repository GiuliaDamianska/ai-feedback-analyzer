import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { FeedbackSource } from './base.js';

export class TextSource extends FeedbackSource {
  constructor(text) {
    super();
    this._text = text;
  }

  async load() {
    return this._text;
  }

  get name() {
    return 'inline-text';
  }
}

export class FileSource extends FeedbackSource {
  constructor(filePath) {
    super();
    this._filePath = filePath;
  }

  async load() {
    return readFileSync(this._filePath, 'utf-8');
  }

  get name() {
    return `file:${this._filePath}`;
  }
}

export async function readStdin() {
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }
  return lines.join('\n');
}
