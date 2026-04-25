"""
Hash Table (Patient Registry) — implemented from scratch.

O(1) average-case lookup, update, and deletion of patients by ID.
Uses separate chaining (linked list per bucket) for collision resolution.

Implementation Details:
    - 64 initial buckets
    - Load factor threshold 0.75 → automatic resize + rehash
    - Custom hash function

Operations:
    set(key, value)       → O(1) avg
    get(key)              → O(1) avg
    delete(key)           → O(1) avg
    update(key, field, v) → O(1) avg
    keys()                → O(n)
    values()              → O(n)
    items()               → O(n)
"""


class _Node:
    """A node in the chaining linked list."""
    __slots__ = ("key", "value", "next")

    def __init__(self, key: str, value, nxt=None):
        self.key = key
        self.value = value
        self.next = nxt


class HashTable:
    """Hash table with chaining, automatic resize at load factor 0.75."""

    INITIAL_CAPACITY = 64
    LOAD_FACTOR_THRESHOLD = 0.75

    def __init__(self):
        self._capacity = self.INITIAL_CAPACITY
        self._size = 0
        self._buckets: list[_Node | None] = [None] * self._capacity

    # ── hash function ────────────────────────────────────────

    def _hash(self, key: str) -> int:
        """DJB2 hash — fast and well-distributed for strings."""
        h = 5381
        for ch in key:
            h = ((h << 5) + h) + ord(ch)  # h * 33 + ord(ch)
        return h % self._capacity

    # ── resize ───────────────────────────────────────────────

    def _resize(self):
        """Double capacity and rehash all entries."""
        old_buckets = self._buckets
        self._capacity *= 2
        self._buckets = [None] * self._capacity
        self._size = 0
        for head in old_buckets:
            node = head
            while node:
                self.set(node.key, node.value)
                node = node.next

    # ── public API ───────────────────────────────────────────

    def set(self, key: str, value):
        """Insert or overwrite a key-value pair."""
        idx = self._hash(key)
        node = self._buckets[idx]
        # Walk chain — update if key exists
        while node:
            if node.key == key:
                node.value = value
                return
            node = node.next
        # Key not found — prepend new node
        new_node = _Node(key, value, self._buckets[idx])
        self._buckets[idx] = new_node
        self._size += 1
        # Resize check
        if self._size / self._capacity > self.LOAD_FACTOR_THRESHOLD:
            self._resize()

    def get(self, key: str):
        """Return value for key, or None if not found."""
        idx = self._hash(key)
        node = self._buckets[idx]
        while node:
            if node.key == key:
                return node.value
            node = node.next
        return None

    def delete(self, key: str) -> bool:
        """Remove key. Returns True if found and removed."""
        idx = self._hash(key)
        node = self._buckets[idx]
        prev = None
        while node:
            if node.key == key:
                if prev:
                    prev.next = node.next
                else:
                    self._buckets[idx] = node.next
                self._size -= 1
                return True
            prev = node
            node = node.next
        return False

    def update(self, key: str, field: str, value) -> bool:
        """Update a single field on the stored dict for key."""
        obj = self.get(key)
        if obj is None:
            return False
        obj[field] = value
        return True

    def contains(self, key: str) -> bool:
        return self.get(key) is not None

    def keys(self) -> list[str]:
        result = []
        for head in self._buckets:
            node = head
            while node:
                result.append(node.key)
                node = node.next
        return result

    def values(self) -> list:
        result = []
        for head in self._buckets:
            node = head
            while node:
                result.append(node.value)
                node = node.next
        return result

    def items(self) -> list[tuple]:
        result = []
        for head in self._buckets:
            node = head
            while node:
                result.append((node.key, node.value))
                node = node.next
        return result

    def size(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self._size == 0

    def clear(self):
        self._buckets = [None] * self.INITIAL_CAPACITY
        self._capacity = self.INITIAL_CAPACITY
        self._size = 0
