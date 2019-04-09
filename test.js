require("fs").readdir(__dirname + "/tests", (err, files) => {
  if (err) throw err;
  var failures = 0;
  files.filter(file => /\.js$/.test(file)).forEach(file => {
    console.log("=== " + file + " ===");
    try {
      require(__dirname + "/tests/" + file);
    } catch (e) {
      console.log("\u001b[91m" + e.stack + "\u001b[0m");
      process.exitCode = 1;
      ++failures;
    }
    console.log();
  });
  console.log(
    failures
      ? "\u001b[91m" + failures + " tests failed\u001b[0m"
      : "OK"
  );
});
