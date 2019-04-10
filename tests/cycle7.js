const { Object, retain, release, collect, check } = require("..")();

function main() {
  var s, t1, t2;

  // obligatory "some people just want to watch the world burn" kind of test

  var cycle1 = new Object("a:outer")
    .add(
      (s = new Object("a:level1"))
        .add(
          (t1 = new Object("a:level2"))
            .add(s) // cycles back to level1
            .add(
              new Object("a:inner")
            )
        )
    );
  var cycle2 = new Object("b:outer")
    .add(
      (s = new Object("b:level1"))
        .add(
          (t2 = new Object("b:level2"))
            .add(s) // cycles back to level1
            .add(
              new Object("b:inner")
            )
        )
    );

  var cycle3 = (s = new Object("c:level1"))
    .add(
      new Object("c:level2")
        .add(
          new Object("c:level3")
            .add(
              new Object("c:level4")
                .add(s) // cycle back to level1
            )
        )
    );

  cycle1.add(cycle2);
  t1.add(cycle2);
  cycle1.add(cycle3);
  cycle2.add(cycle1);
  t2.add(cycle1);
  t2.add(cycle3);

  retain(cycle1);

  cycle1.checkAlive();
  cycle2.checkAlive();
  cycle3.checkAlive();

  collect();
  collect();
  collect();

  cycle1.add(cycle2);
  t1.add(cycle2);
  cycle1.add(cycle3);
  cycle2.add(cycle1);
  t2.add(cycle1);
  t2.add(cycle3);
  collect();

  collect();
  cycle3.add(t1);
  collect();
  cycle3.add(t2);
  collect();

  collect();
  collect();
  collect();

  cycle1.checkAlive();
  cycle2.checkAlive();
  cycle3.checkAlive();

  release(cycle1);
}

main();
collect();
check();
