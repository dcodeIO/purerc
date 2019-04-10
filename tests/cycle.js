const { Object, retain, release, collect, check } = require("..")();

function main() {
  var s;
  release(
    retain(
      (s = new Object("self"))
        .add(s) // cycle to self
    )
  );
}

main();
collect();
check();
