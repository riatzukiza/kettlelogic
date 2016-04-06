var maybe = require("../functional/logical.js").maybe.binary;
class DoublyLinkedNode {
    constructor(prev, x, next) {
        this.next = next;
        this.prev = prev;
        this.value = x;
    }
    insertAfter(x) {
        var newNode = new DoublyLinkedNode(this, x, this.next);
        this.next.prev = newNode;
        this.next = newNode;
    }
    insertBefore(x) {
        var newNode = new DoublyLinkedNode(this.prev, x, this);
        this.prev.next = newNode;
        this.prev = newNode;
    }
    removeAfter() {
        return this.next.remove();
    }
    removeBefore() {
        return this.prev.remove();
    }
    remove() {
        this.next.prev = this.prev;
        this.prev.next = this.next;
        this.next = null;
        this.prev = null;
        return this.value;
    }
}
