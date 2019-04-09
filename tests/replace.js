const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  var b = retain(new Object("b"));
  b = (retain(a), release(b), a);
  try {
    return retain(b);
  } finally {
    release(a);
    release(b);
  }
}

function main() {
  release(
    someFunction(
      retain(
        new Object("a")
      )
    )
  );
}

main();
collect();
check();
