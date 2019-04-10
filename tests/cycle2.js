const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  try {
    return retain(a);
  } finally {
    release(a);
  }
}

function main() {
  var s;
  release(
    someFunction(
      retain(
        (s = new Object("array"))
          .add(
            new Object("element")
              .add(s) // cycle back to array
          )
      )
    )
  );
}

main();
collect();
check();
