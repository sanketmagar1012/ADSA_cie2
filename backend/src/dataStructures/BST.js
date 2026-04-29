class BSTNode {
  constructor(id, patient) {
    this.id = id;
    this.patient = patient;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(id, patient) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      throw new Error("ID must be numeric for BST insertion.");
    }

    this.root = this.insertNode(this.root, numericId, patient);
  }

  insertNode(node, id, patient) {
    if (!node) {
      return new BSTNode(id, patient);
    }

    if (id < node.id) {
      node.left = this.insertNode(node.left, id, patient);
    } else if (id > node.id) {
      node.right = this.insertNode(node.right, id, patient);
    } else {
      node.patient = patient;
    }

    return node;
  }

  searchById(id) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return null;
    }

    let current = this.root;
    while (current) {
      if (numericId === current.id) {
        return current.patient;
      }

      current = numericId < current.id ? current.left : current.right;
    }

    return null;
  }

  rangeQuery(low, high) {
    const lowId = Number(low);
    const highId = Number(high);
    if (Number.isNaN(lowId) || Number.isNaN(highId)) {
      return [];
    }

    const results = [];
    this.inOrderRange(this.root, lowId, highId, results);
    return results;
  }

  inOrderRange(node, low, high, results) {
    if (!node) {
      return;
    }

    if (low < node.id) {
      this.inOrderRange(node.left, low, high, results);
    }

    if (node.id >= low && node.id <= high) {
      results.push(node.patient);
    }

    if (high > node.id) {
      this.inOrderRange(node.right, low, high, results);
    }
  }
}

module.exports = BST;
