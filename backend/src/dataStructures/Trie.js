class TrieNode {
  constructor() {
    this.children = {};
    this.ids = new Set();
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  insert(name, id) {
    const normalizedName = this.normalize(name);
    if (!normalizedName || id === undefined || id === null) {
      return;
    }

    let currentNode = this.root;
    for (const char of normalizedName) {
      if (!currentNode.children[char]) {
        currentNode.children[char] = new TrieNode();
      }
      currentNode = currentNode.children[char];
      currentNode.ids.add(String(id));
    }
    currentNode.isEndOfWord = true;
  }

  searchByPrefix(prefix) {
    const normalizedPrefix = this.normalize(prefix);
    if (!normalizedPrefix) {
      return [];
    }

    let currentNode = this.root;
    for (const char of normalizedPrefix) {
      if (!currentNode.children[char]) {
        return [];
      }
      currentNode = currentNode.children[char];
    }

    return [...currentNode.ids];
  }
}

module.exports = Trie;
