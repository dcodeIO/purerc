module.exports = function() {

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
    GREEN: "GREEN",
    /** Candidate cycle undergoing Σ-computation. */
    RED: "RED",
    /** Candidate cycle awaiting epoch boundary. */
    ORANGE: "ORANGE"
  };

  var count = 0;

  class Object {

    constructor(name) {
      this.name = name;
      this.rc = 0;
      this.crc = 0;
      this.color = Color.BLACK;
      this.buffered = false;
      this.children = [];
      ++count;
      console.log("create(" + this + ") count=" + count);
    }

    add(s) {
      increment(s);
      this.children.push(s);
      return this;
    }

    remove(s) {
      var i = this.children.indexOf(s);
      if (~i) {
        this.children.splice(i, 1);
        decrement(s);
      }
    }
  
    toString() {
      return this.name + ": rc=" + this.rc + " color=" + this.color + " buffered=" + this.buffered;
    }
  }

  var roots = [];
  var currentCycle;
  var cycleBuffer = [];

  function increment(s) {
    console.log("increment(" + s + ")");
    s.rc = s.rc + 1;
    scanBlack(s);
  }

  function decrement(s) {
    console.log("decrement(" + s + ")");
    s.rc = s.rc - 1;
    if (s.rc == 0) {
      release(s);
    } else {
      possibleRoot(s);
    }
  }

  function release(s) {
    console.log("release(" + s + ")");
    for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
      let t = s.children[ti];
      decrement(t);
    }
    s.color = Color.BLACK;
    if (!s.buffered) {
      free(s);
    }
  }

  function possibleRoot(s) {
    console.log("possibleRoot(" + s + ")");
    scanBlack(s);
    s.color = Color.PURPLE;
    if (!s.buffered) {
      s.buffered = true;
      roots.push(s);
    }
  }

  function collectCycles() {
    console.log("collectCycles");
    freeCycles();
    findCycles();
    sigmaPreparation();
  }

  function findCycles() {
    console.log("findCycles");
    markRoots();
    scanRoots();
    collectRoots();
  }

  function markRoots() {
    console.log("markRoots");
    var sn = 0;
    for (let si = 0, sk = roots.length; si < sk; ++si) {
      let s = roots[si];
      if (s.color == Color.PURPLE && s.rc > 0) {
        markGray(s);
        roots[sn++] = s;
      } else {
        s.buffered = false;
        if (s.rc == 0) {
          free(s);
        }
      }
    }
    roots.length = sn;
  }

  function scanRoots() {
    console.log("scanRoots");
    for (let si = 0, sk = roots.length; si < sk; ++si) {
      let s = roots[si];
      scan(s);
    }
  }

  function collectRoots() {
    console.log("collectRoots");
    for (let si = 0, sk = roots.length; si < sk; ++si) {
      let s = roots[si];
      if (s.color == Color.WHITE) {
        currentCycle = [];
        collectWhite(s);
        cycleBuffer.push(currentCycle);
      } else {
        s.buffered = false;
      }
    }
    roots.length = 0;
  }

  function markGray(s) {
    console.log("markGray(" + s + ")");
    if (s.color != Color.GRAY) {
      s.color = Color.GRAY;
      s.crc = s.rc;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        markGray(t);
      }
    } else if (s.crc > 0) {
      s.crc = s.crc - 1;
    }
  }

  function scan(s) {
    console.log("scan(" + s + ")");
    if (s.color == Color.GRAY && s.crc == 0) {
      s.color = Color.WHITE;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        scan(t);
      }
    } else {
      scanBlack(s);
    }
  }

  function scanBlack(s) {
    console.log("scanBlack(" + s + ")");
    if (s.color != Color.BLACK) {
      s.color = Color.BLACK;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        scanBlack(t);
      }
    }
  }

  function collectWhite(s) {
    console.log("collectWhite(" + s + ")");
    if (s.color == Color.WHITE) {
      s.color = Color.ORANGE;
      s.buffered = true;
      currentCycle.push(s);
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        collectWhite(t);
      }
    }
  }

  function sigmaPreparation() {
    console.log("sigmaPreparation");
    for (let ci = 0, ck = cycleBuffer.length; ci < ck; ++ci) {
      let c = cycleBuffer[ci];
      for (let ni = 0, nk = c.length; ni < nk; ++ni) {
        let n = c[ni];
        n.color = Color.RED;
        n.crc = n.rc;
      }
      for (let ni = 0, nk = c.length; ni < nk; ++ni) {
        let n = c[ni];
        for (let mi = 0, mk = n.children.length; mi < mk; ++mi) {
          let m = n.children[mi];
          if (m.color == Color.RED && m.crc > 0) {
            m.crc = m.crc - 1;
          }
        }
      }
      for (let ni = 0, nk = c.length; ni < nk; ++ni) {
        let n = c[ni];
        n.color = Color.ORANGE;
      }
    }
  }

  function freeCycles() {
    console.log("freeCycles");
    var last = cycleBuffer.length - 1;
    for (let ci = last; ci >= 0; --ci) {
      let c = cycleBuffer[ci];
      if (deltaTest(c) && sigmaTest(c)) {
        freeCycle(c);
      } else {
        refurbish(c);
      }
    }
    cycleBuffer.length = 0;
  }

  function deltaTest(c) {
    console.log("deltaTest(" + c + ")");
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      if (n.color != Color.ORANGE) {
        return false;
      }
    }
    return true;
  }

  function sigmaTest(c) {
    console.log("sigmaTest(" + c + ")");
    var externRC = 0;
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      externRC = externRC + n.crc;
    }
    return externRC == 0;
  }

  function refurbish(c) {
    console.log("refurbish(" + c + ")");
    var first = true;
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      if ((first && n.color == Color.ORANGE) || n.color == Color.PURPLE) {
        n.color = Color.PURPLE;
        roots.push(n);
      } else {
        n.color = Color.BLACK;
        n.buffered = false;
      }
      first = false;
    }
  }

  function freeCycle(c) {
    console.log("freeCycle(" + c + ")");
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      n.color = Color.RED;
    }
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      for (let mi = 0, mk = n.children.length; mi < mk; ++mi) {
        let m = n.children[mi];
        cyclicDecrement(m);
      }
    }
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      free(n);
    }
  }

  function cyclicDecrement(m) {
    console.log("cyclicDecrement(" + m + ")");
    if (m.color != Color.RED) {
      if (m.color == Color.ORANGE) {
        m.rc = m.rc - 1;
        m.crc = m.crc - 1;
      } else {
        decrement(m);
      }
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
    collect: function() {
      collectCycles();
      collectCycles();
    },
    check: function() {
      if (count) {
        console.log("@roots", roots);
        console.log("@currentCycle", currentCycle);
        console.log("@cycleBuffer", cycleBuffer);
        throw Error("leak");
      }
      console.log("[ OK ]");
    }
  };
};
