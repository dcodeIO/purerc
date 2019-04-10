const parallel = true;

if (parallel) {
  const cluster = require("cluster");
  if (cluster.isMaster) {
    const ncpus = require('os').cpus().length;
    for (let i = 0; i < ncpus; ++i) {
      let worker = cluster.fork();
      // worker.on("message", args => {
      //   console.log(`[${i}] Run #${args.runCount} (${args.roots} roots, ${args.objects} objects)`);
      // });
    }
    cluster.on("exit", (worker, code, signal) => {
      throw Error(`Worker ${worker.process.pid} died`);
    });
    return;
  } else {
    console.log(`Worker ${process.pid} started`);
    console.log = function() {};
  }
}

const gc = require(".");
gc.silent = true;

var runCount = 0;

function rand(min, max) {
  var val = min + ((Math.random() * ((max - min) + 1)) | 0);
  if (val < min || val > max) throw Error();
  return val;
}

function run() {
  const { Object, retain, release, collect, check } = gc();

  var roots = [];
  var objects = [];
  const softObjectLimit = 1e5;

  function makeRandom(depth = 1) {
    var s;
    switch (rand(0, 2)) {
      case 0: {
        if (objects.length) {
          s = objects[rand(0, objects.length - 1)];
          break;
        }
      }
      case 1: {
        if (objects.length < softObjectLimit) {
          s = new Object("array");
          s.add(makeRandom(depth + 1));
          objects.push(s);
          if (objects.length < softObjectLimit) s.add(makeRandom(depth + 1));
          if (objects.length < softObjectLimit) s.add(makeRandom(depth + 1));
          break;
        }
      }
      case 2: {
        s = new Object("object");
        objects.push(s);
        break;
      }
      default: throw Error();
    }
    return s;
  }

  console.log(`=== Run ${process.pid} #${++runCount} ===`);

  console.time("retain");
  for (let i = 0, k = rand(1, 10); i < k; ++i) {
    roots.push(
      retain(
        makeRandom()
      )
    );
  }
  console.timeEnd("retain");

  console.log("roots: " + roots.length);
  console.log("objects: " + objects.length);

  console.time("collect");
  collect();
  console.timeEnd("collect");

  roots.forEach(root => {
    root.checkAlive();
  });

  console.time("release");
  roots.forEach(release);
  console.timeEnd("release");

  console.time("collectFinal");
  collect();
  console.timeEnd("collectFinal");

  check();
  roots.forEach(root => {
    root.checkDead();
  });

  console.log();

  // if (parallel) {
  //   process.send({
  //     runCount: runCount,
  //     roots: roots.length,
  //     objects: objects.length
  //   });
  // }
}

while (true) run();
