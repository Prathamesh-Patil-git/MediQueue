# 🗂️ Hash Table Data Structure — MediQueue

## Table of Contents

1. [What is a Hash Table?](#1-what-is-a-hash-table)
2. [Complete Working Code](#2-complete-working-code)
3. [How it Works in MediQueue](#3-how-it-works-in-mediqueue)
4. [Step-by-Step Working Explanation](#4-step-by-step-working-explanation)
5. [Comparison with Other Techniques](#5-comparison-with-other-techniques)
6. [Why We Use a Hash Table](#6-why-we-use-a-hash-table)
7. [Separate Chaining — The Collision Resolution Concept](#7-separate-chaining--the-collision-resolution-concept)

---

## 1. What is a Hash Table?

A **Hash Table** (also called a Hash Map) is a data structure that stores **key-value pairs** and provides **O(1) average-case** time for insertion, lookup, and deletion.

It works by using a **hash function** to convert the key into an **index** in an internal array (called "buckets"). The value is then stored at that index.

```
Key: "P-A3F2C1"  →  Hash Function  →  Index: 17  →  Bucket[17] stores the patient record
```

### Core Properties

| Property             | Value                        |
|----------------------|------------------------------|
| Average Lookup       | O(1)                         |
| Average Insert       | O(1)                         |
| Average Delete       | O(1)                         |
| Worst Case (all)     | O(n) — when all keys collide |
| Space Complexity     | O(n)                         |
| Collision Resolution | Separate Chaining            |

---

## 2. Complete Working Code

This is the **custom-built** hash table used in MediQueue — no Python `dict` used. Located at `backend/structures/hash_table.py`.

### 2.1 — Node Class (Linked List Node for Chaining)

```python
class _Node:
    """A node in the chaining linked list."""
    __slots__ = ("key", "value", "next")

    def __init__(self, key: str, value, nxt=None):
        self.key = key
        self.value = value
        self.next = nxt
```

- Each `_Node` stores a **key**, a **value**, and a pointer to the **next** node.
- `__slots__` is used instead of `__dict__` for memory efficiency.
- These nodes form a **singly linked list** inside each bucket.

### 2.2 — Hash Table Class

```python
class HashTable:
    """Hash table with chaining, automatic resize at load factor 0.75."""

    INITIAL_CAPACITY = 64
    LOAD_FACTOR_THRESHOLD = 0.75

    def __init__(self):
        self._capacity = self.INITIAL_CAPACITY       # number of buckets
        self._size = 0                                # number of stored entries
        self._buckets: list[_Node | None] = [None] * self._capacity  # bucket array
```

- Starts with **64 buckets**.
- `_size` tracks total key-value pairs stored.
- When `_size / _capacity > 0.75`, the table **doubles** in size and rehashes.

### 2.3 — DJB2 Hash Function

```python
def _hash(self, key: str) -> int:
    """DJB2 hash — fast and well-distributed for strings."""
    h = 5381
    for ch in key:
        h = ((h << 5) + h) + ord(ch)   # equivalent to: h * 33 + ord(ch)
    return h % self._capacity
```

**How DJB2 works:**
1. Start with seed value `5381`.
2. For each character: multiply current hash by 33, add the character's ASCII code.
3. Take modulo of capacity to get a valid bucket index.

**Example:**
```
Key = "P-A3F2C1"

h = 5381
h = (5381 * 33) + ord('P')  = 177633 + 80    = 177713
h = (177713 * 33) + ord('-') = 5864529 + 45   = 5864574
h = (5864574 * 33) + ord('A') = 193530942 + 65 = 193531007
...continue for remaining characters...
h = final_value % 64  →  bucket index (e.g., 17)
```

### 2.4 — Dynamic Resizing

```python
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
```

When load factor exceeds 0.75:
1. Save old buckets.
2. Double `_capacity`.
3. Create fresh empty bucket array.
4. Re-insert every existing entry (re-hash needed because `% capacity` changes).

### 2.5 — Set (Insert / Update)

```python
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
```

### 2.6 — Get (Lookup)

```python
def get(self, key: str):
    """Return value for key, or None if not found."""
    idx = self._hash(key)
    node = self._buckets[idx]
    while node:
        if node.key == key:
            return node.value
        node = node.next
    return None
```

### 2.7 — Delete

```python
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
```

### 2.8 — Update a Single Field

```python
def update(self, key: str, field: str, value) -> bool:
    """Update a single field on the stored dict for key."""
    obj = self.get(key)
    if obj is None:
        return False
    obj[field] = value
    return True
```

### 2.9 — Utility Methods

```python
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
```

---

## 3. How it Works in MediQueue

In MediQueue, the Hash Table serves as the **Patient Registry** — the central lookup store for all patient records.

### 3.1 — Initialization (in `state.py`)

```python
from backend.structures.hash_table import HashTable

registry = HashTable()    # DS 2 — Patient Registry
```

The `registry` is a **global in-memory** hash table shared across the entire application.

### 3.2 — Patient Registration (`POST /patient/register`)

When a new patient is registered, their record is inserted into the hash table:

```python
patient = {
    "patient_id": "P-A3F2C1",
    "name": "Rahul Sharma",
    "age": 45,
    "emergency_type": "Chest Pain",
    "urgency": "Critical",
    "priority_score": 100,
    "status": "waiting",
    ...
}

state.registry.set(patient_id, patient)   # O(1) insert
```

**What happens internally:**
```
1. Hash "P-A3F2C1" using DJB2  →  bucket index 17
2. Check bucket[17] chain — key not found
3. Create new _Node("P-A3F2C1", patient_dict)
4. Prepend to bucket[17]'s linked list
5. Increment _size, check load factor
```

### 3.3 — Patient Lookup (`GET /patient/{patient_id}`)

```python
patient = state.registry.get(patient_id)   # O(1) lookup
if not patient:
    raise HTTPException(status_code=404, detail="Patient not found")
```

### 3.4 — Status Update (by Scheduler)

After the greedy scheduler assigns an appointment, it updates the registry:

```python
reg_patient = state.registry.get(patient["patient_id"])  # O(1)
if reg_patient:
    reg_patient["status"] = "scheduled"
    reg_patient["appointment_id"] = appointment["appointment_id"]
    reg_patient["scheduled_time"] = next_slot
```

### 3.5 — Patient Deletion (`DELETE /patient/{patient_id}`)

```python
state.registry.delete(patient_id)   # O(1) delete
```

### 3.6 — Priority Aging Updates

During aging passes, the registry is updated to keep scores in sync:

```python
reg = state.registry.get(p["patient_id"])   # O(1) lookup
if reg:
    reg["wait_time_bonus"] = new_bonus
    reg["priority_score"] = new_score
```

### 3.7 — Trie Search Enrichment

When the Trie returns patient IDs from a name search, the registry enriches them:

```python
results = state.trie.search(prefix)
for r in results:
    patient = state.registry.get(r["patient_id"])   # O(1) per result
    if patient:
        enriched.append(patient)
```

### 3.8 — System Health Check

```python
@app.get("/health")
def health():
    return {
        "registry_size": state.registry.size(),   # how many patients stored
        ...
    }
```

### Data Flow Diagram

```
Patient Registers
       │
       ▼
┌──────────────────────────────────────────────────┐
│              Hash Table (Registry)                │
│                                                   │
│  Bucket[0]  → None                                │
│  Bucket[1]  → None                                │
│  ...                                              │
│  Bucket[17] → [P-A3F2C1 | patient_data] → None   │
│  Bucket[18] → None                                │
│  Bucket[19] → [P-B7D4E2 | data] → [P-F1C9A3 | data] → None  │
│  ...                                              │
│  Bucket[63] → None                                │
└──────────────────────────────────────────────────┘
       │                    │                  │
       ▼                    ▼                  ▼
   GET /patient/id     Scheduler updates   Trie enrichment
   (instant lookup)    (status changes)    (name → full record)
```

---

## 4. Step-by-Step Working Explanation

### Example Walkthrough: Registering 3 Patients

**Step 1 — Register "Rahul Sharma" (ID: P-A3F2C1)**

```
_hash("P-A3F2C1") → 17
Bucket[17] is empty → insert new node
Bucket[17]: [P-A3F2C1 | {name: "Rahul", ...}] → None
_size = 1, load_factor = 1/64 = 0.016 ✓
```

**Step 2 — Register "Priya Patel" (ID: P-B7D4E2)**

```
_hash("P-B7D4E2") → 42
Bucket[42] is empty → insert new node
Bucket[42]: [P-B7D4E2 | {name: "Priya", ...}] → None
_size = 2, load_factor = 2/64 = 0.031 ✓
```

**Step 3 — Register "Amit Desai" (ID: P-C9E1F3) — COLLISION with bucket 17**

```
_hash("P-C9E1F3") → 17   (same bucket as Rahul!)
Bucket[17] has a node → walk chain, key doesn't match → prepend
Bucket[17]: [P-C9E1F3 | {name: "Amit", ...}] → [P-A3F2C1 | {name: "Rahul", ...}] → None
_size = 3
```

**Step 4 — Lookup "P-A3F2C1"**

```
_hash("P-A3F2C1") → 17
Walk bucket[17]: node.key = "P-C9E1F3" ≠ target → next
                  node.key = "P-A3F2C1" == target → FOUND! Return value
```

**Step 5 — Delete "P-C9E1F3"**

```
_hash("P-C9E1F3") → 17
Walk bucket[17]: node.key = "P-C9E1F3" == target, prev = None
  → Set bucket[17] = node.next
Bucket[17]: [P-A3F2C1 | {name: "Rahul", ...}] → None
_size = 2
```

---

## 5. Comparison with Other Techniques

### 5.1 — Hash Table vs. Array / List

| Criteria              | Hash Table        | Array / List      |
|-----------------------|-------------------|-------------------|
| Search by Key         | **O(1)** avg      | O(n)              |
| Insert                | **O(1)** avg      | O(1) append / O(n) sorted |
| Delete by Key         | **O(1)** avg      | O(n)              |
| Memory Usage          | Higher (buckets)  | Lower             |
| Ordered?              | ❌ No              | ✅ Yes             |
| Key-based Access      | ✅ Yes             | ❌ Only by index   |

**Why NOT Array?** In MediQueue we need instant patient lookup by ID. An array would need O(n) linear scan every time.

### 5.2 — Hash Table vs. Binary Search Tree (BST)

| Criteria              | Hash Table        | BST               |
|-----------------------|-------------------|-------------------|
| Search                | **O(1)** avg      | O(log n) avg      |
| Insert                | **O(1)** avg      | O(log n) avg      |
| Delete                | **O(1)** avg      | O(log n) avg      |
| Ordered Traversal     | ❌ No              | ✅ Yes (in-order)  |
| Worst Case            | O(n)              | O(n) unbalanced   |
| Range Queries         | ❌ Not efficient   | ✅ Efficient       |

**Why NOT BST?** We don't need ordered traversal of patients by ID. We already use an AVL Tree for the schedule (where ordering matters). For the registry, raw speed matters most → hash table wins.

### 5.3 — Hash Table vs. AVL Tree (used in MediQueue for scheduling)

| Criteria              | Hash Table        | AVL Tree           |
|-----------------------|-------------------|---------------------|
| Lookup by Key         | **O(1)**          | O(log n)            |
| Insert                | **O(1)**          | O(log n)            |
| Always Balanced?      | N/A               | ✅ Yes              |
| In-Order Traversal    | ❌ No              | ✅ Yes (sorted)     |
| Find Next Available   | ❌ Can't do this   | ✅ Yes              |
| Use Case in MediQueue | Patient Registry  | Appointment Schedule |

### 5.4 — Hash Table vs. Trie (used in MediQueue for name search)

| Criteria              | Hash Table        | Trie               |
|-----------------------|-------------------|---------------------|
| Exact Key Lookup      | **O(1)**          | O(m) where m=key length |
| Prefix Search         | ❌ Impossible      | ✅ O(prefix + results) |
| Autocomplete          | ❌ No              | ✅ Yes              |
| Memory                | Lower             | Higher              |
| Use Case in MediQueue | ID-based lookup   | Name-based search   |

### 5.5 — Summary: Why Hash Table is the Best Choice for Patient Registry

```
                    Search Speed
                         │
         Hash Table ★    │
              O(1) ──────┤
                         │
        AVL Tree         │
           O(log n) ─────┤
                         │
        Linked List      │
             O(n) ───────┤
                         │
                         └──────────────────── n (patients)
```

The Patient Registry needs:
- ✅ Instant lookup by patient ID → **Hash Table O(1)**
- ✅ Instant update of patient status → **Hash Table O(1)**
- ✅ Instant delete on cancellation → **Hash Table O(1)**
- ❌ Does NOT need sorted order (that's the AVL Tree's job)
- ❌ Does NOT need prefix search (that's the Trie's job)

**Hash Table is the perfect fit.**

---

## 6. Why We Use a Hash Table

### 6.1 — The Problem

MediQueue handles **hundreds of patients** in real-time. Every API call needs to:

1. **Find** a patient by ID instantly (when viewing, updating, scheduling).
2. **Update** patient fields (status, priority score, appointment) without delay.
3. **Delete** patients instantly when they cancel or are processed.

Using a list would make every operation O(n) — unacceptable for a real-time system.

### 6.2 — The Solution: O(1) Average-Case Everything

| Operation in MediQueue               | Hash Table Method         | Time    |
|---------------------------------------|---------------------------|---------|
| Register patient                      | `registry.set(id, data)`  | O(1)    |
| View patient details                  | `registry.get(id)`        | O(1)    |
| Update status to "scheduled"          | `registry.get(id)` + mutate | O(1) |
| Update priority score (aging)         | `registry.get(id)` + mutate | O(1) |
| Cancel / remove patient               | `registry.delete(id)`     | O(1)    |
| Check if patient exists               | `registry.contains(id)`   | O(1)    |
| Get total patient count               | `registry.size()`         | O(1)    |
| System reset                          | `registry.clear()`        | O(1)    |
| Enrich Trie search results            | `registry.get(id)` × k   | O(k)    |

### 6.3 — Real-World Flow

```
[Frontend]                    [Backend API]                [Hash Table]
    │                              │                            │
    ├─ Register Patient ──────────►│                            │
    │                              ├── registry.set(id, data) ─►│ O(1)
    │                              │                            │
    ├─ View Dashboard ────────────►│                            │
    │                              ├── registry.values() ──────►│ O(n)
    │                              │                            │
    ├─ Search by Name ────────────►│                            │
    │                              ├── trie.search(prefix)      │
    │                              ├── registry.get(id) × k ──►│ O(1) each
    │                              │                            │
    ├─ Run Scheduler ─────────────►│                            │
    │                              ├── registry.get(id) ───────►│ O(1)
    │                              ├── mutate status ──────────►│ O(1)
    │                              │                            │
    ├─ Cancel Patient ────────────►│                            │
    │                              ├── registry.delete(id) ────►│ O(1)
```

---

## 7. Separate Chaining — The Collision Resolution Concept

### 7.1 — What is a Collision?

A collision happens when **two different keys** produce the **same bucket index** after hashing.

```
_hash("P-A3F2C1") → 17
_hash("P-C9E1F3") → 17    ← COLLISION! Both map to bucket 17
```

This is inevitable because we have **infinite possible keys** but **finite buckets** (64 initially).

### 7.2 — What is Separate Chaining?

Separate Chaining solves collisions by storing a **linked list** at each bucket. When multiple keys hash to the same index, they are added as nodes in that bucket's linked list.

```
Bucket Array (size = 64)
┌──────────┐
│ Bucket 0 │ → None
├──────────┤
│ Bucket 1 │ → None
├──────────┤
│   ...    │
├──────────┤
│Bucket 17 │ → [P-C9E1F3 | data] → [P-A3F2C1 | data] → None
├──────────┤     (collision chain — both hashed to 17)
│Bucket 18 │ → None
├──────────┤
│   ...    │
├──────────┤
│Bucket 42 │ → [P-B7D4E2 | data] → None
├──────────┤
│   ...    │
├──────────┤
│Bucket 63 │ → None
└──────────┘
```

### 7.3 — How Operations Work with Chaining

**INSERT (set):**
```
1. Compute index = _hash(key)
2. Walk the chain at buckets[index]
3. If key found → update value (overwrite)
4. If key NOT found → prepend new node to chain head
5. Check load factor → resize if > 0.75
```

**SEARCH (get):**
```
1. Compute index = _hash(key)
2. Walk the chain at buckets[index]
3. Compare each node.key with target key
4. If found → return node.value
5. If chain ends → return None
```

**DELETE:**
```
1. Compute index = _hash(key)
2. Walk the chain, tracking previous node
3. If found:
   - If prev exists → prev.next = node.next (unlink)
   - If no prev → buckets[index] = node.next (new head)
4. Decrement _size
```

### 7.4 — Why Separate Chaining (vs Open Addressing)?

| Feature                | Separate Chaining       | Open Addressing (Linear Probing) |
|------------------------|-------------------------|----------------------------------|
| Collision Handling     | Linked list per bucket  | Probe next empty slot            |
| Clustering Problem     | ❌ No clustering         | ⚠️ Primary clustering            |
| Load Factor Tolerance  | Can exceed 1.0          | Must stay < 1.0                  |
| Delete Complexity      | Simple (unlink node)    | Complex (tombstones needed)      |
| Cache Performance      | Lower (pointer chasing) | Higher (contiguous memory)       |
| Implementation         | Simpler                 | More complex                     |

**We chose Separate Chaining because:**
1. **Simpler implementation** — easier to understand and debug.
2. **No clustering** — performance stays consistent even with many collisions.
3. **Easy deletion** — just unlink a node (no tombstone markers).
4. **Graceful degradation** — even if load factor spikes, it still works (just slower chains).

### 7.5 — Load Factor and Resizing

The **load factor** = `_size / _capacity` measures how full the table is.

```
Load Factor = number_of_entries / number_of_buckets

Example: 48 patients / 64 buckets = 0.75 → THRESHOLD REACHED → RESIZE!
```

**When load factor exceeds 0.75:**
1. Double capacity: 64 → 128 buckets.
2. Rehash ALL existing entries (because `hash % capacity` changes).
3. Chains become shorter → performance stays O(1).

```
BEFORE resize (64 buckets, 48 entries, LF = 0.75):
Bucket[17]: [P1] → [P2] → [P3] → None    (chain length 3)

AFTER resize (128 buckets, 48 entries, LF = 0.375):
Bucket[17]:  [P1] → None                  (chain length 1)
Bucket[81]:  [P2] → None                  (chain length 1)
Bucket[145]: [P3] → None                  (chain length 1)
  ↑ keys now hash to different buckets with the new capacity
```

### 7.6 — Time Complexity Analysis

| Scenario             | Average Case | Worst Case           |
|----------------------|-------------|----------------------|
| Good hash + low LF   | **O(1)**    | —                    |
| Many collisions       | O(1+α)     | O(n) all in 1 bucket |
| After resize          | **O(1)**    | —                    |

Where **α = load factor** (kept ≤ 0.75 by automatic resizing).

In practice, with DJB2 hash and 0.75 threshold, the average chain length stays around **1-2 nodes**, making virtually every operation a constant-time O(1).

---

## Summary

| Aspect                  | Detail                                                  |
|-------------------------|---------------------------------------------------------|
| **Data Structure**      | Hash Table with Separate Chaining                       |
| **Role in MediQueue**   | Patient Registry — central lookup store                 |
| **Hash Function**       | DJB2 (seed=5381, multiply by 33, add char)              |
| **Initial Capacity**    | 64 buckets                                              |
| **Load Factor Limit**   | 0.75 → triggers automatic 2× resize + rehash            |
| **Collision Strategy**  | Separate Chaining (linked list per bucket)              |
| **Average Performance** | O(1) for set, get, delete, update                       |
| **Why chosen?**         | Fastest key-value access; registry doesn't need ordering |
| **Paired with**         | Max-Heap (priority), AVL Tree (schedule), Trie (search) |
