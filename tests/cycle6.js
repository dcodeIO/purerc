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
        new Object("outer")
          .add(
            (s = new Object("level1"))
              .add(
                new Object("level2")
                  .add(s) // cycles back to level1
                  .add(
                    new Object("inner")
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
