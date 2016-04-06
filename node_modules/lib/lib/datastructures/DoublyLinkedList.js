"use strict";
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
        return newNode;
    }
    insertBefore(x) {
        var newNode = new DoublyLinkedNode(this.prev, x, this);
        this.prev.next = newNode;
        this.prev = newNode;
        return newNode;
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
class DoublyLinkedList {
    constructor(a) {
        this.head = new DoublyLinkedNode(null, null, null);
        this.tail = new DoublyLinkedNode(this.head, null, null);
        this.head.next = this.tail;
        this.length = 0;
        this.push_array(a || []);
    }
    push_array(a) {
        a.forEach((e) => {
            this.push_head(e);
        });
    }
    push_head(x) {
        var node = this.head.insertAfter(x);
        this.length++;
        return node;
    }
    push_tail(x) {
        var node = this.tail.insertBefore(x);
        this.length++;
        return node;
    }
    pop_tail() {
        if (this.tail.prev !== this.head) {
            this.length--;
            return this.tail.removeBefore();
        }
        return -1;
    }
    pop_head() {
        if (this.head.next !== this.tail) {
            this.length--;
            return this.head.removeAfter();
        }
        return -1;
    }
    concat(list) {
        return new DoublyLinkedList(this.toArray().concat(list.toArray()))
    }
    map_head(f, args) {
        var list = new this.constructor(...args);
        this.forEach_head((x) => {
            list.push_head(f(x));
        });
        return list;
    }
    map_tail() {
        var list = new this.constructor();
        this.forEach_tail((x) => {
            list.push_tail(f(x));
        });
        return list;
    }
    copy() {
        return this.map_head((x => x), arguments);
    }
    forEach_head(f) {
        return maybe((node) => {
            while (node != this.tail) {
                f(node.value);
                node = node.next;
            }
        }, () => false,this.head.next);
    }
    forEach_tail(f) {
        return maybe(
            (node) => {
                while (node != this.head) {
                    f(node.value);
                    node = node.prev;
                }
            }, () => false,this.tail.prev);
    }
}
module.exports = {
    DoublyLinkedList: DoublyLinkedList,
    DoublyLinkedNode: DoublyLinkedNode
};
