const { Object, retain, release, collect, check } = require("..")();

function main() {
  release(
    retain(
      new Object("1")
    )
  );
}

main();
collect();
check();
