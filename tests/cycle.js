const { Object, retain, release, collect, check } = require("..")();

function main() {
  var o;
  release(
    retain(
      o = new Object("1"),
      o.add(o)
    )
  );
}

main();
collect();
check();
