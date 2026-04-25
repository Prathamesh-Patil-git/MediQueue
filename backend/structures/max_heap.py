"""
Max-Heap (Priority Queue) — implemented from scratch.

Holds all waiting patients ordered by priority score (highest first).
Core of the entire scheduling engine.

Operations:
    insert(patient)             → O(log n)
    extract_max()               → O(log n)
    peek()                      → O(1)
    update_priority(id, score)  → O(n)
    size()                      → O(1)
    to_sorted_list()            → O(n log n) — for display purposes
"""


class MaxHeap:
    """A max-heap that orders patients by their priority_score field."""

    def __init__(self):
        self._heap = []  # list of patient dicts

    # ── helpers ──────────────────────────────────────────────

    def _parent(self, i):
        return (i - 1) // 2

    def _left(self, i):
        return 2 * i + 1

    def _right(self, i):
        return 2 * i + 2

    def _swap(self, i, j):
        self._heap[i], self._heap[j] = self._heap[j], self._heap[i]

    def _key(self, i):
        """Return the sorting key for element at index i.
        Higher priority_score comes first; ties broken by earlier arrival."""
        p = self._heap[i]
        return (p["priority_score"], -p.get("arrival_order", 0))

    # ── heapify operations ───────────────────────────────────

    def _sift_up(self, i):
        """Restore heap property upward after insert."""
        while i > 0 and self._key(i) > self._key(self._parent(i)):
            self._swap(i, self._parent(i))
            i = self._parent(i)

    def _sift_down(self, i):
        """Restore heap property downward after extract."""
        n = len(self._heap)
        while True:
            largest = i
            l, r = self._left(i), self._right(i)
            if l < n and self._key(l) > self._key(largest):
                largest = l
            if r < n and self._key(r) > self._key(largest):
                largest = r
            if largest == i:
                break
            self._swap(i, largest)
            i = largest

    # ── public API ───────────────────────────────────────────

    def insert(self, patient: dict):
        """Insert a patient dict into the heap.  O(log n)."""
        self._heap.append(patient)
        self._sift_up(len(self._heap) - 1)

    def extract_max(self) -> dict | None:
        """Remove and return the highest-priority patient.  O(log n)."""
        if not self._heap:
            return None
        if len(self._heap) == 1:
            return self._heap.pop()
        root = self._heap[0]
        self._heap[0] = self._heap.pop()
        self._sift_down(0)
        return root

    def peek(self) -> dict | None:
        """Return (but don't remove) the highest-priority patient.  O(1)."""
        return self._heap[0] if self._heap else None

    def update_priority(self, patient_id: str, new_score: float):
        """Find a patient by id, update their score, and re-heapify.  O(n)."""
        for idx, p in enumerate(self._heap):
            if p["patient_id"] == patient_id:
                old_score = p["priority_score"]
                p["priority_score"] = new_score
                if new_score > old_score:
                    self._sift_up(idx)
                else:
                    self._sift_down(idx)
                return True
        return False

    def remove_by_id(self, patient_id: str) -> dict | None:
        """Remove a specific patient by id.  O(n)."""
        for idx, p in enumerate(self._heap):
            if p["patient_id"] == patient_id:
                removed = self._heap[idx]
                # Replace with last element, then fix heap
                last = self._heap.pop()
                if idx < len(self._heap):
                    self._heap[idx] = last
                    self._sift_up(idx)
                    self._sift_down(idx)
                return removed
        return None

    def size(self) -> int:
        return len(self._heap)

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def to_sorted_list(self) -> list[dict]:
        """Return all patients sorted by priority (highest first).
        Non-destructive — works on a copy.  O(n log n)."""
        temp = MaxHeap()
        temp._heap = list(self._heap)  # shallow copy
        result = []
        while not temp.is_empty():
            result.append(temp.extract_max())
        return result

    def get_all(self) -> list[dict]:
        """Return the raw heap array (unordered). O(1)."""
        return list(self._heap)

    def clear(self):
        self._heap.clear()
