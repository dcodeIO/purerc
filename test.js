require("fs").readdir(__dirname + "/tests", (err, files) => {
  if (err) throw err;
  files.filter(file => /\.js$/.test(file)).forEach(file => {
    console.log("=== " + file + " ===");
    require(__dirname + "/tests/" + file);
    console.log();
  });
});
