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
        new Object("array")
          .add(new Object("element1"))
          .add(new Object("element2"))
          .add(new Object("element3"))
      )
    )
  );
}

main();
collect();
check();
