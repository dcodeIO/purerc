module.exports = function() {

  // Fig. 7. Synchronous Cycle Collection

  const Color = {
    BLACK: "BLACK",
    GRAY: "GRAY",
    WHITE: "WHITE",
    PURPLE: "PURPLE"
  };

  var count = 0;

  class Object {
    constructor(name) {
      this.name = name;
      this.rc = 0;
      this.color = Color.BLACK;
      this.buffered = false;
      this.children = [];
      console.log("create(" + this + ")");
      ++count;
    }

    add(s) {
      increment(s);
      this.children.push(s);
      return this;
    }

    remove(s) {
      var i = this.children.indexOf(s);
      if (~i) decrement(this.children.splice(i, 1)[0]);
    }
  
    toString() {
      return this.name + ": rc=" + this.rc + " color=" + this.color + " buffered=" + this.buffered;
    }
  }

  var roots = [];

  function increment(s) {
    s.rc = s.rc + 1;
    console.log("increment(" + s + ")");
    s.color = Color.BLACK;
  }

  function decrement(s) {
    s.rc = s.rc - 1;
    console.log("decrement(" + s + ")");
    if (s.rc == 0) {
      release(s);
    } else {
      possibleRoot(s);
    }
  }

  function release(s) {
    console.log("release(" + s + ")");
    s.children.forEach(t => {
      decrement(t);
    });
    s.color = Color.BLACK;
    if (!s.buffered) {
      systemFree(s);
    }
  }

  function possibleRoot(s) {
    if (s.color != Color.PURPLE) {
      s.color = Color.PURPLE;
      if (!s.buffered) {
        s.buffered = true;
        roots.push(s);
      }
    }
    console.log("possibleRoot(" + s + ")");
  }

  function collectCycles() {
    markRoots();
    scanRoots();
    collectRoots();
  }

  function markRoots() {
    roots = roots.filter(s => {
      if (s.color == Color.PURPLE && s.rc > 0) {
        markGray(s);
        return true; // keep
      } else {
        s.buffered = false;
        if (s.color == Color.BLACK && s.rc == 0) {
          systemFree(s);
        }
        return false; // remove
      }
    });
  }

  function scanRoots() {
    roots.forEach(s => {
      scan(s);
    });
  }

  function collectRoots() {
    roots = roots.filter(s => {
      s.buffered = false;
      collectWhite(s);
      return false;
    });
  }

  function markGray(s) {
    if (s.color != Color.GRAY) {
      s.color = Color.GRAY;
      s.children.forEach(t => {
        t.rc = t.rc - 1;
        markGray(t);
      });
    }
  }

  function scan(s) {
    if (s.color == Color.GRAY) {
      if (s.rc > 0) {
        scanBlack(s);
      } else {
        s.color = Color.WHITE;
        s.children.forEach(t => {
          scan(t);
        });
      }
    }
  }

  function scanBlack(s) {
    s.color = Color.BLACK;
    s.children.forEach(t => {
      t.rc = t.rc + 1;
      if (t.color != Color.BLACK) {
        scanBlack(t);
      }
    });
  }

  function collectWhite(s) {
    console.log("collectWhite(" + s + ")");
    if (s.color == Color.WHITE && !s.buffered) {
      s.color = Color.BLACK;
      s.children.forEach(t => {
        collectWhite(t);
      });
      systemFree(s);
    }
  }

  function systemFree(s) {
    --count;
    console.log("free(" + s + ") remain=" + count);
  }

  return {
    Object,
    retain: function(s) {
      if (s) increment(s);
      return s;
    },
    release: function(s) {
      if (s) decrement(s);
      return s;
    },
    collect: collectCycles,
    check: function() {
      if (count) throw Error("leak");
      console.log("[ OK ]");
    }
  };
};
