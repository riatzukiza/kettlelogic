var maybe = require("../functional/logical.js").maybe.binary;
var DoublyLinkedListNode = require("./DLinkedNode.js");
var Interface = require("../interface").Interface;
var DLinkedList = List
        .Constructor(function DoublyLinkedList(a) {
            this.head = new DoublyLinkedNode(null, null, null);
            this.tail = new DoublyLinkedNode(this.head, null, null);
            this.head.next = this.tail;
        })
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
        this.head.insertAfter(x);
        this.length++;
    }
    push_tail(x) {
        this.tail.insertBefore(x);
        this.length++;
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
