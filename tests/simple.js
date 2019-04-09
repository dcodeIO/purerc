const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  try {
    return retain(a);
  } finally {
    release(a);
  }
}

function main() {
  release(
    someFunction(
      retain(
        new Object("1")
      )
    )
  );
}

main();
collect();
check();
