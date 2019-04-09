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
        s = new Object("level0"),
        t = new Object("level1->2,3"),
        u = new Object("level2->3,2,0"),
        v = new Object("level3->1,2"),
        v.add(t), v.add(u),
        u.add(v), u.add(u), u.add(s),
        t.add(u), t.add(v),
        s.add(t)
      )
    )
  );
}

main();
collect();
check();
