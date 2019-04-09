const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  var b = retain(a);
  var c = retain(b);
  try {
    return retain(b);
  } finally {
    release(a);
    release(b);
    release(c);
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
