function log(msg) {
  if (!gc.silent) console.log(msg);
}

function gc() {

  // Fig. 9. Concurrent Cycle Collection Algorithm

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
      this._color = Color.BLACK;
      this.buffered = false;
      this.children = [];
      this.freed = false;
      ++count;
      log("create(" + this + ") count=" + count);
    }

    get isAcyclic() {
      return !this.cyclesTo(this);
    }

    cyclesTo(other, except = new Set()) {
      if (except.has(this)) return false;
      except.add(this);
      for (let child of this.children) {
        if (
          child == other ||
          child.cyclesTo(other, except)
        ) return true;
      }
      return false;
    }

    get color() {
      return this._color;
    }

    set color(color) {
      log(" " + this.name + ": " + this._color + " -> " + color);
      this._color = color;
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
      return this.name + ": rc=" + this.rc + " crc=" + this.crc + " color=" + this.color + " buffered=" + this.buffered;
    }

    checkAlive(except = new Set()) {
      if (except.has(this)) return;
      except.add(this);
      if (this.freed || !count) throw Error("should be alive");
      for (let i = 0, k = this.children.length; i < k; ++i) {
        this.children[i].checkAlive(except);
      }
    }

    checkDead(except = new Set()) {
      if (except.has(this)) return;
      except.add(this);
      if (!this.freed) throw Error("should be dead");
      for (let i = 0, k = this.children.length; i < k; ++i) {
        this.children[i].checkDead(except);
      }
    }
  }

  var roots = [];
  var cycleBuffer = [];

  function increment(s) {
    log("increment(" + s + ")");
    s.rc = s.rc + 1;
    scanBlack(s);
  }

  function decrement(s) {
    log("decrement(" + s + ")");
    s.rc = s.rc - 1;
    if (s.rc == 0) {
      release(s);
    } else if (!s.isAcyclic) {
      possibleRoot(s);
    }
  }

  function release(s) {
    log("release(" + s + ")");
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
    log("possibleRoot(" + s + ")");
    scanBlack(s);
    s.color = Color.PURPLE;
    if (!s.buffered) {
      s.buffered = true;
      roots.push(s);
    }
  }

  function collectCycles() {
    log("collectCycles");
    freeCycles();
    findCycles();
    sigmaPreparation();
  }

  function findCycles() {
    log("findCycles");
    markRoots();
    scanRoots();
    collectRoots();
  }

  function markRoots() {
    log("markRoots");
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
    log("scanRoots");
    for (let si = 0, sk = roots.length; si < sk; ++si) {
      let s = roots[si];
      scan(s);
    }
  }

  function collectRoots() {
    log("collectRoots");
    for (let si = 0, sk = roots.length; si < sk; ++si) {
      let s = roots[si];
      if (s.color == Color.WHITE) {
        let currentCycle = [];
        collectWhite(s, currentCycle);
        cycleBuffer.push(currentCycle);
      } else {
        s.buffered = false;
      }
    }
    roots.length = 0;
  }

  function markGray(s) {
    log("markGray(" + s + ")");
    if (s.color != Color.GRAY) {
      s.color = Color.GRAY;
      s.crc = s.rc;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        markGray(t);
        if (t.crc > 0) {
          t.crc = t.crc - 1;
        }
      }
    }
  }

  function scan(s) {
    log("scan(" + s + ")");
    if (s.color == Color.GRAY) {
      if (s.crc > 0) {
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
    log("scanBlack(" + s + ")");
    if (s.color != Color.BLACK) {
      s.color = Color.BLACK;
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        scanBlack(t);
      }
    }
  }

  function collectWhite(s, currentCycle) {
    log("collectWhite(" + s + ")");
    if (s.color == Color.WHITE) {
      s.color = Color.ORANGE;
      s.buffered = true;
      currentCycle.push(s);
      for (let ti = 0, tk = s.children.length; ti < tk; ++ti) {
        let t = s.children[ti];
        collectWhite(t, currentCycle);
      }
    }
  }

  function sigmaPreparation() {
    log("sigmaPreparation");
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
    log("freeCycles");
    var last = cycleBuffer.length - 1;
    for (let ci = last; ci >= 0; --ci) {
      let c = cycleBuffer[ci];
      if (sigmaDeltaTest(c)) {
        freeCycle(c);
      } else {
        refurbish(c);
      }
    }
    cycleBuffer.length = 0;
  }

  function sigmaDeltaTest(c) {
    var externRC = 0;
    for (let ni = 0, nk = c.length; ni < nk; ++ni) {
      let n = c[ni];
      if (n.color != Color.ORANGE) {
        return false;
      }
      externRC = externRC + n.crc;
    }
    return externRC == 0;
  }

  function refurbish(c) {
    log("refurbish(" + c + ")");
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
    log("freeCycle(" + c + ")");
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
    log("cyclicDecrement(" + m + ")");
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
    log("free(" + s + ") count=" + count);
    s.freed = true;
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
      if (count) throw Error("leaking " + count + " objects");
    }
  };
};

module.exports = gc;
