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
        s = new Object("cyclic"),
        s.add(s)
      )
    )
  );
}

main();
collect();
check();
