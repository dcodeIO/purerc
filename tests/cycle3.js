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
        s = new Object("level1->2"),
        t = new Object("level2->3"),
        u = new Object("level3->4"),
        v = new Object("level4->1"),
        v.add(s),
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
