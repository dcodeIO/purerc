const { Object, retain, release, collect, check } = require("..")();

function someFunction(a) {
  var c;
  {
    let b;
    try {
      b = retain(a);
      c = retain(b);
    } finally {
      release(b);
    }
  }
  try {
    return retain(c);
  } finally {
    release(a);
    release(c);
  }
}

function main() {
  release(
    someFunction(
      retain(
        new Object("1")
      )
    )
  );
}

main();
collect();
check();
