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
        (s = new Object("level1"))
          .add(
            new Object("level2")
              .add(
                new Object("level3")
                  .add(
                    new Object("level4")
                      .add(s) // cycle back to level1
                  )
              )
          )
      )
    )
  );
}

main();
collect();
check();
