const { Object, retain, release, collect, check } = require("..")();

function main() {
  var s, t1, t2;

  // two cycles that contain each other in such a way that concurrent breaks

  var cycle1 = new Object("outer")
    .add(
      (s = new Object("level1"))
        .add(
          (t1 = new Object("level2"))
            .add(s) // cycles back to level1
            .add(
              new Object("inner")
            )
        )
    );
  var cycle2 = new Object("outer")
    .add(
      (s = new Object("level1"))
        .add(
          (t2 = new Object("level2"))
            .add(s) // cycles back to level1
            .add(
              new Object("inner")
            )
        )
    );

  // cycle1.add(cycle2);
  t1.add(cycle2);
  // cycle2.add(cycle1);
  t2.add(cycle1);

  release(
    retain(
      cycle1
    )
  );
}

main();
collect();
collect(); // ?
collect(); // ?
check();
