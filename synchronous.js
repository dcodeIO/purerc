module.exports = function() {

  // Fig. 7. Synchronous Cycle Collection

  const Color = {
    /** In use or free. */
    BLACK: "BLACK",
    /** Possible member of cycle. */
    GRAY: "GRAY",
    /** Member of cycle. */
    WHITE: "WHITE",
    /** Possible root of cycle. */
    PURPLE: "PURPLE",
    /** Acyclic. */
    GREEN: "GREEN"
  };

  var count = 0;

  class Object {

    constructor(name) {
      this.name = name;
      this.rc = 0;
      this._color = Color.BLACK;
      this.buffered = false;
      this.children = [];
      ++count;
      console.log("create(" + this + ") count=" + count);
    }

    get color() {
      return this._color;
    }

    set color(color) {
      console.log(" " + this.name + ": " + this._color + " -> " + color);
      this._color = color;
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
    console.log("increment(" + s + ")");
    s.rc = s.rc + 1;
    s.color = Color.BLACK;
  }

  function decrement(s) {
    console.log("decrement(" + s + ")");

    s.rc = s.rc - 1;
    if (s.rc == 0) {
      console.log("release(" + s + ")");
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        decrement(t);
      }
      s.color = Color.BLACK;
      if (!s.buffered) {
        free(s);
      }

    } else {
      console.log("possibleRoot(" + s + ")");
      if (s.color != Color.PURPLE) {
        s.color = Color.PURPLE;
        if (!s.buffered) {
          s.buffered = true;
          roots.push(s);
        }
      }

    }
  }

  function collectCycles() {
    console.log("collectCycles");

    // markRoots
    var k = 0;
    for (let i = 0, K = roots.length; i < K; ++i) {
      let s = roots[i];
      if (s.color == Color.PURPLE && s.rc > 0) {
        markGray(s);
        roots[k++] = s;
      } else {
        s.buffered = false;
        if (s.color == Color.BLACK && s.rc == 0) {
          free(s);
        }
      }
    }
    roots.length = k;

    // scanRoots
    for (let i = 0; i < k; ++i) {
      let s = roots[i];
      scan(s);
    }

    // collectRoots
    for (let i = 0; i < k; ++i) {
      let s = roots[i];
      s.buffered = false;
      collectWhite(s);
    }

    roots.length = 0;
  }

  function markGray(s) {
    console.log("markGray(" + s + ")");
    if (s.color != Color.GRAY) {
      s.color = Color.GRAY;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        t.rc = t.rc - 1;
        markGray(t);
      }
    }
  }

  function scan(s) {
    console.log("scan(" + s + ")");
    if (s.color == Color.GRAY) {
      if (s.rc > 0) {
        scanBlack(s);
      } else {
        s.color = Color.WHITE;
        for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
          let t = s.children[ti];
          scan(t);
        }
      }
    }
  }

  function scanBlack(s) {
    console.log("scanBlack(" + s + ")");
    s.color = Color.BLACK;
    for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
      let t = s.children[ti];
      t.rc = t.rc + 1;
      if (t.color != Color.BLACK) {
        scanBlack(t);
      }
    }
  }

  function collectWhite(s) {
    console.log("collectWhite(" + s + ")");
    if (s.color == Color.WHITE && !s.buffered) {
      s.color = Color.BLACK;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        collectWhite(t);
      }
      free(s);
    }
  }

  function free(s) {
    --count;
    console.log("free(" + s + ") count=" + count);
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
      if (count) throw Error("leaking " + count + " objects");
    }
  };
};
