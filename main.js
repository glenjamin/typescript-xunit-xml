const readline = require('readline');

const xmlbuilder = require('xmlbuilder');

/**
 * @typedef { import("stream").Readable } Readable
 * @typedef { import("stream").Writable } Writable
 */

/**
 * @param {Readable} input
 * @param {Writable} output
 */
async function main(input, output) {
    if (process.stdin.isTTY) {
      throw new Error("expected input to be piped in");
    }

    const parser = newParser();

    const rl = readline.createInterface({
      input,
      crlfDelay: Infinity
    })
    for await (const line of rl) {
      parser.parse(line);
    }

    const xml = toJunit(parser.errors);
    output.write(xml);
}

/**
 * @typedef {object} Parser
 * @property {CompilerError[]} errors
 * @property {(line: string) => void} parse
 *
 * @typedef {object} CompilerError
 * @property {string} filename
 * @property {number} line
 * @property {number} col
 * @property {string} code
 * @property {string} message
 * @property {string} [source]
 */

// We only handle the format without --pretty right now
const UGLY_REGEX = /^(?<file>.+?)\((?<line>\d+),(?<col>\d+)\): error (?<code>\S+?): (?<message>.+)$/;

/**
 * @returns {Parser}
 */
function newParser() {
  const errors = [];
  function parse(line) {
    const match = UGLY_REGEX.exec(line);
    if (match) {
      errors.push({
        filename: match.groups.file,
        line: Number(match.groups.line),
        col: Number(match.groups.col),
        code: match.groups.code,
        message: match.groups.message
      })
      return;
    }
  }
  return {errors, parse};
}

/**
 * @param {CompilerError[]} errors
 * @returns {string}
 */
function toJunit(errors) {
  const obj = {
    testsuite: {
      "@name": "Typescript type errors",
      "@tests": errors.length,
      "@failures": errors.length,
      testcase: errors.map((err) => ({
        "@name": err.code,
        "@classname": err.filename + ":" + err.line + ":" + err.col,
        failure: {
          "@type": err.code,
          "@message": err.message,
        }
      }))
    }
  };
  return xmlbuilder.create(obj).end({ pretty: true});;
}

if (require.main) {
  main(process.stdin, process.stdout)
    .catch(err => {
      console.error("ERROR: " + err.message);
      process.exit(1);
    });
}
