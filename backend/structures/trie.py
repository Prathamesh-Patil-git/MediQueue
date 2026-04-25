"""
Trie (Patient Name Search / Autocomplete) — implemented from scratch.

Enables fast prefix-based patient name search.
Type "Ami" → returns all patients whose name starts with "Ami".
Powers the autocomplete search bar on the frontend.

Operations:
    insert(name, patient_id)  → O(m) where m = name length
    search(prefix)            → O(m + k) where k = number of results
    delete(name)              → O(m)
"""


class _TrieNode:
    __slots__ = ("children", "is_end", "patient_ids")

    def __init__(self):
        self.children: dict[str, "_TrieNode"] = {}
        self.is_end: bool = False
        self.patient_ids: list[str] = []  # IDs of patients with this exact name


class Trie:
    """Trie for prefix-based patient name autocomplete."""

    def __init__(self):
        self._root = _TrieNode()

    def insert(self, name: str, patient_id: str):
        """Insert a patient name (lowercased) with associated ID."""
        node = self._root
        for ch in name.lower():
            if ch not in node.children:
                node.children[ch] = _TrieNode()
            node = node.children[ch]
        node.is_end = True
        if patient_id not in node.patient_ids:
            node.patient_ids.append(patient_id)

    def _find_node(self, prefix: str) -> "_TrieNode | None":
        """Navigate to the node representing the last char of prefix."""
        node = self._root
        for ch in prefix.lower():
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def _collect_all(self, node: _TrieNode, prefix: str, results: list):
        """DFS to collect all words below this node."""
        if node.is_end:
            for pid in node.patient_ids:
                results.append({"name": prefix, "patient_id": pid})
        for ch, child in sorted(node.children.items()):
            self._collect_all(child, prefix + ch, results)

    def search(self, prefix: str) -> list[dict]:
        """Return all patients whose name starts with 'prefix'.
        Each result is {"name": ..., "patient_id": ...}."""
        node = self._find_node(prefix)
        if not node:
            return []
        results = []
        self._collect_all(node, prefix.lower(), results)
        return results

    def delete(self, name: str, patient_id: str | None = None) -> bool:
        """Remove a name (or specific patient_id) from the trie.
        Returns True if something was removed."""
        return self._delete(self._root, name.lower(), 0, patient_id)

    def _delete(self, node: _TrieNode, name: str, depth: int,
                patient_id: str | None) -> bool:
        if depth == len(name):
            if not node.is_end:
                return False
            if patient_id:
                if patient_id in node.patient_ids:
                    node.patient_ids.remove(patient_id)
                if not node.patient_ids:
                    node.is_end = False
            else:
                node.is_end = False
                node.patient_ids.clear()
            return True

        ch = name[depth]
        if ch not in node.children:
            return False

        result = self._delete(node.children[ch], name, depth + 1, patient_id)

        # Clean up empty nodes
        child = node.children[ch]
        if not child.is_end and not child.children:
            del node.children[ch]

        return result

    def clear(self):
        self._root = _TrieNode()
