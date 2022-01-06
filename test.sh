#!/bin/sh

cat sample.txt | node main.js > actual.txt
result=$?

git diff --exit-code --no-index expected.txt actual.txt
diff=$?

if [ "$result" != "1" ]; then
  echo "Unexpected exit code $result. Expected 1"
  exit 1
fi

if [ "$diff" != "0" ]; then
  echo "Unexpected output diff"
  exit 1
fi
