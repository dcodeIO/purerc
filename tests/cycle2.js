const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  try {
    return retain(a);
  } finally {
    release(a);
  }
}

function main() {
  var s, t;
  release(
    someFunction(
      retain(
        s = new Object("array"),
        t = new Object("element"),
        t.add(s),
        s.add(t)
      )
    )
  );
}

main();
collect();
check();