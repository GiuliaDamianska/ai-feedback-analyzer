import 'dotenv/config';
import { analyzeFeedback } from './src/analyzers/feedbackAnalyzer.js';
import { TextSource, FileSource, readStdin } from './src/sources/text.js';

function printAnalysis(analysis) {
  const hr = (char = '─', width = 60) => char.repeat(width);

  console.log('\n' + hr('═'));
  console.log('  FEEDBACK ANALYSIS');
  console.log(hr('═'));

  console.log('\n  SUMMARY');
  console.log(hr());
  console.log(analysis.summary);

  console.log('\n  THEMES (' + analysis.themes.length + ')');
  console.log(hr());
  for (const [i, theme] of analysis.themes.entries()) {
    const badge = `[${theme.sentiment} · ${theme.frequency} frequency]`;
    console.log(`\n  ${i + 1}. ${theme.name}  ${badge}`);
    console.log(`     ${theme.description}`);
    if (theme.examples.length > 0) {
      console.log('     Examples:');
      for (const ex of theme.examples) {
        console.log(`       · "${ex}"`);
      }
    }
  }

  const ordered = [...analysis.action_points].sort((a, b) => {
    return { high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority];
  });

  console.log('\n  ACTION POINTS (' + ordered.length + ')');
  console.log(hr());
  for (const [i, ap] of ordered.entries()) {
    console.log(`\n  ${i + 1}. [${ap.priority.toUpperCase()}] ${ap.action}`);
    console.log(`     Why:   ${ap.rationale}`);
    console.log(`     Theme: ${ap.related_theme}`);
  }

  console.log('\n' + hr('═') + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const filteredArgs = args.filter((a) => a !== '--json');

  let source;

  if (filteredArgs[0] === '--file' && filteredArgs[1]) {
    source = new FileSource(filteredArgs[1]);
  } else if (filteredArgs[0] === '--stdin' || (!process.stdin.isTTY && filteredArgs.length === 0)) {
    const text = await readStdin();
    source = new TextSource(text);
  } else if (filteredArgs.length > 0) {
    source = new TextSource(filteredArgs.join(' '));
  } else {
    console.error('Usage:');
    console.error('  node index.js "Your feedback text here"');
    console.error('  node index.js --file feedback.txt');
    console.error('  echo "feedback" | node index.js');
    console.error('');
    console.error('Flags:');
    console.error('  --json   Output raw JSON instead of formatted text');
    process.exit(1);
  }

  const feedbackText = await source.load();

  if (!jsonOutput) {
    console.error(`Analyzing feedback from: ${source.name} …`);
  }

  const analysis = await analyzeFeedback(feedbackText);

  if (jsonOutput) {
    console.log(JSON.stringify(analysis, null, 2));
  } else {
    printAnalysis(analysis);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
