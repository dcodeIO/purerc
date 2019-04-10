A repository to fiddle around with pure automatic reference counting.

After [the paper](./papers/Bacon03Pure.pdf) "A Pure Reference Counting Garbage Collector" by David F. Bacon et al.

Considerations
--------------

TL;DR If you can break it, please do.

The [concurrent algorithm](./concurrent.js), as described in the paper, does not work as-is, and the fixes I applied are mostly guesswork.

Acyclic detection differs from the assumptions made in the paper, in that all nodes that do not directly or indirectly reference themselves are considered acyclic. New assumption is that even if another cyclic node can be reached from an acyclic parent, it will eventually become marked as a possible root, i.e. when the acyclic parent becomes collected.
