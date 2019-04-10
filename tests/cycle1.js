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
        (s = new Object("self"))
          .add(s) // cycle to self
      )
    )
  );
}

main();
collect();
check();
