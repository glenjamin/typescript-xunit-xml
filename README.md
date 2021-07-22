# typescript-xunit-xml

Produce xUnit-style XML output from typescript compiler messages

## Installation

```sh
npm install --save-dev typescript-xunit-xml
```

## Usage

```sh
tsc | typescript-xunit-xml | tee junit.xml
```

## Roadmap

Support for `--pretty` output that includes the source code snippet is intended.

## License

MIT
