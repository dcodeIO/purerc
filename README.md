A repository to fiddle around with pure automatic reference counting.

After [the paper](./papers/Bacon03Pure.pdf) "A Pure Reference Counting Garbage Collector" by David F. Bacon et al.

Considerations
--------------

TL;DR If you can break it, please do.

The concurrent algorithm, as described in the paper, does not work as-is. It misses that in `MarkGray`, each `T` is reachable from `S` as well, which isn't recursively taken into account by the else clause that is responsible to decrement `CRC` of each object reachable from within the graph. Also, unlike its synchronous variant, the concurrent `Scan` routine recursively recolors nodes already marked `white` to `black`, preventing them from being collected. Hence, patches applied here are as follows:

```diff
 MarkGray(S)
   if (color(S) != gray)
     color(S) = gray
     CRC(S) = RC(S)
     for T in children(S)
       MarkGray(T)
-  else if (CRC(S) > 0)
-    CRC(S) = CRC(S) - 1
+      if (CRC(T) > 0)
+        CRC(T) = CRC(T) - 1

 Scan(S)
-  if (color(S) == gray and CRC(S) == 0)
-    color(S) = white
-    for T in children(S)
-      Scan(T)
-  else
-    ScanBlack(s)
+  if (color(S) == gray)
+    if (CRC(S) > 0)
+      ScanBlack(s)
+    else
+      color(S) = white
+      for T in children(S)
+        Scan(T)
```

Apart from that, the prototypical acyclic detection in this implementation differs from the assumptions made in the paper, in that all nodes that cannot directly or indirectly reference their own kind are considered acyclic, which a static compiler can prove. The underlying assumption is that if an acyclic parent's `RC` is decremented and the parent is in turn released, the `RC` of each child is decremented, leading to the cyclic child to be considered as a possible root anyway.
