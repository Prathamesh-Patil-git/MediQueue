"""
AVL Tree (Appointment Schedule) — implemented from scratch.

Stores scheduled appointments keyed by start_time (minutes from 00:00).
Self-balancing BST guarantees O(log n) insert, search, delete.
In-order traversal yields the full time-sorted schedule.

Operations:
    insert(appointment)      → O(log n)
    search(time)             → O(log n)
    delete(time)             → O(log n)
    in_order()               → O(n)
"""


class _AVLNode:
    __slots__ = ("key", "value", "left", "right", "height")

    def __init__(self, key: int, value: dict):
        self.key = key          # start_time in minutes
        self.value = value      # appointment dict
        self.left = None
        self.right = None
        self.height = 1


class AVLTree:
    """Self-balancing AVL tree for appointment scheduling."""

    def __init__(self):
        self._root = None
        self._size = 0

    # ── height / balance helpers ─────────────────────────────

    def _height(self, node):
        return node.height if node else 0

    def _balance_factor(self, node):
        return self._height(node.left) - self._height(node.right) if node else 0

    def _update_height(self, node):
        node.height = 1 + max(self._height(node.left), self._height(node.right))

    # ── rotations ────────────────────────────────────────────

    def _rotate_right(self, z):
        y = z.left
        t3 = y.right
        y.right = z
        z.left = t3
        self._update_height(z)
        self._update_height(y)
        return y

    def _rotate_left(self, z):
        y = z.right
        t2 = y.left
        y.left = z
        z.right = t2
        self._update_height(z)
        self._update_height(y)
        return y

    def _rebalance(self, node):
        """Apply rotations if node is unbalanced."""
        self._update_height(node)
        bf = self._balance_factor(node)

        # Left-heavy
        if bf > 1:
            if self._balance_factor(node.left) < 0:
                node.left = self._rotate_left(node.left)  # LR case
            return self._rotate_right(node)                # LL case

        # Right-heavy
        if bf < -1:
            if self._balance_factor(node.right) > 0:
                node.right = self._rotate_right(node.right)  # RL case
            return self._rotate_left(node)                   # RR case

        return node

    # ── insert ───────────────────────────────────────────────

    def _insert(self, node, key, value):
        if not node:
            self._size += 1
            return _AVLNode(key, value)
        if key < node.key:
            node.left = self._insert(node.left, key, value)
        elif key > node.key:
            node.right = self._insert(node.right, key, value)
        else:
            # Key collision — overwrite value
            node.value = value
            return node
        return self._rebalance(node)

    def insert(self, appointment: dict):
        """Insert an appointment keyed by its start_time."""
        key = appointment["start_time"]
        self._root = self._insert(self._root, key, appointment)

    # ── search ───────────────────────────────────────────────

    def _search(self, node, key):
        if not node:
            return None
        if key == node.key:
            return node.value
        elif key < node.key:
            return self._search(node.left, key)
        else:
            return self._search(node.right, key)

    def search(self, time: int) -> dict | None:
        """Check if a time slot is taken. Returns appointment or None."""
        return self._search(self._root, time)

    # ── delete ───────────────────────────────────────────────

    def _min_node(self, node):
        while node.left:
            node = node.left
        return node

    def _delete(self, node, key):
        if not node:
            return None
        if key < node.key:
            node.left = self._delete(node.left, key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        else:
            self._size -= 1
            if not node.left:
                return node.right
            if not node.right:
                return node.left
            # Two children — replace with in-order successor
            successor = self._min_node(node.right)
            node.key = successor.key
            node.value = successor.value
            self._size += 1  # compensate — recursive call will decrement
            node.right = self._delete(node.right, successor.key)
        return self._rebalance(node)

    def delete(self, time: int) -> bool:
        """Remove appointment at given time. Returns True if found."""
        old_size = self._size
        self._root = self._delete(self._root, time)
        return self._size < old_size

    # ── in-order traversal ───────────────────────────────────

    def _in_order(self, node, result):
        if node:
            self._in_order(node.left, result)
            result.append(node.value)
            self._in_order(node.right, result)

    def in_order(self) -> list[dict]:
        """Return all appointments sorted by start_time."""
        result = []
        self._in_order(self._root, result)
        return result

    # ── find next available slot ─────────────────────────────

    def find_next_available(self, start: int = 0, slot_duration: int = 15) -> int:
        """Find the earliest available slot starting from 'start'.
        Checks every slot_duration-minute interval."""
        occupied = {appt["start_time"] for appt in self.in_order()}
        t = start
        while t in occupied:
            t += slot_duration
        return t

    # ── utilities ────────────────────────────────────────────

    def size(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self._size == 0

    def clear(self):
        self._root = None
        self._size = 0
