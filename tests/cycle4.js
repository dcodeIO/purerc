const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  try {
    return retain(a);
  } finally {
    release(a);
  }
}

function main() {
  var s, t, u, v;
  release(
    someFunction(
      retain(
        s = new Object("outer"),
        t = new Object("level1->2"),
        u = new Object("level2->3"),
        v = new Object("level3->1"),
        v.add(t),
        u.add(v),
        t.add(u),
        s.add(t)
      )
    )
  );
}

main();
collect();
check();
