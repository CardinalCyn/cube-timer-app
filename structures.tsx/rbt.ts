// Red-Black Tree implementation in TypeScript

export class Node<T> {
  data: T;
  left: Node<T> | null = null;
  right: Node<T> | null = null;
  red: boolean = true;

  constructor(data: T) {
    this.data = data;
  }

  get_child(dir: boolean): Node<T> | null {
    return dir ? this.right : this.left;
  }

  set_child(dir: boolean, val: Node<T> | null): void {
    if (dir) {
      this.right = val;
    } else {
      this.left = val;
    }
  }
}

export class RBTree<T> {
  private _root: Node<T> | null = null;
  private _comparator: (a: T, b: T) => number;
  public size: number = 0;

  constructor(comparator: (a: T, b: T) => number) {
    this._comparator = comparator;
  }

  insert(data: T): boolean {
    let ret = false;

    if (this._root === null) {
      this._root = new Node(data);
      ret = true;
      this.size++;
    } else {
      const head = new Node<T>(null as any); // fake tree root

      let dir = false;
      let last = false;

      let gp: Node<T> | null = null;
      let ggp: Node<T> = head;
      let p: Node<T> | null = null;
      let node: Node<T> | null = this._root;
      ggp.right = this._root;

      while (true) {
        if (node === null) {
          node = new Node(data);
          p!.set_child(dir, node);
          ret = true;
          this.size++;
        } else if (is_red(node.left) && is_red(node.right)) {
          node.red = true;
          node.left!.red = false;
          node.right!.red = false;
        }

        if (is_red(node) && is_red(p)) {
          const dir2 = ggp.right === gp;
          if (node === p!.get_child(last)) {
            ggp.set_child(dir2, single_rotate(gp!, !last));
          } else {
            ggp.set_child(dir2, double_rotate(gp!, !last));
          }
        }

        const cmp = this._comparator(node.data, data);
        if (cmp === 0) break;

        last = dir;
        dir = cmp < 0;

        if (gp !== null) ggp = gp;
        gp = p;
        p = node;
        node = node.get_child(dir);
      }

      this._root = head.right;
    }

    this._root!.red = false;
    return ret;
  }

  remove(data: T): boolean {
    if (this._root === null) return false;

    const head = new Node<T>(null as any);
    let node: Node<T> | null = head;
    node.right = this._root;
    let p: Node<T> | null = null;
    let gp: Node<T> | null = null;
    let found: Node<T> | null = null;
    let dir: boolean = true;

    while ((node as Node<T>).get_child(dir) !== null) {
      const last = dir;

      gp = p;
      p = node;
      node = (node as Node<T>).get_child(dir);

      const cmp = this._comparator(data, node!.data);
      dir = cmp > 0;

      if (cmp === 0) found = node;

      if (!is_red(node) && !is_red(node!.get_child(dir))) {
        if (is_red(node!.get_child(!dir))) {
          const sr = single_rotate(node!, dir);
          p!.set_child(last, sr);
          p = sr;
        } else if (!is_red(node!.get_child(!dir))) {
          const sibling = p!.get_child(!last);
          if (sibling !== null) {
            if (
              !is_red(sibling.get_child(!last)) &&
              !is_red(sibling.get_child(last))
            ) {
              p!.red = false;
              sibling.red = true;
              node!.red = true;
            } else {
              const dir2 = gp!.right === p;
              if (is_red(sibling.get_child(last))) {
                gp!.set_child(dir2, double_rotate(p!, last));
              } else if (is_red(sibling.get_child(!last))) {
                gp!.set_child(dir2, single_rotate(p!, last));
              }

              const gpc = gp!.get_child(dir2)!;
              gpc.red = true;
              node!.red = true;
              gpc.left!.red = false;
              gpc.right!.red = false;
            }
          }
        }
      }
    }

    if (found !== null) {
      found.data = node!.data;
      p!.set_child(p!.right === node, node!.get_child(node!.left === null));
      this.size--;
    }

    this._root = head.right;
    if (this._root !== null) {
      this._root.red = false;
    }

    return found !== null;
  }

  contains(value: T): boolean {
    let node = this._root;
    while (node !== null) {
      const cmp = this._comparator(value, node.data);
      if (cmp === 0) return true;
      node = node.get_child(cmp > 0);
    }
    return false;
  }

  clear(): void {
    this._root = null;
    this.size = 0;
  }

  getLeast(): T | null {
    let node = this._root;
    if (!node) return null;

    while (node.left !== null) {
      node = node.left;
    }
    return node.data;
  }

  getGreatest(): T | null {
    let node = this._root;
    if (!node) return null;

    while (node.right !== null) {
      node = node.right;
    }
    return node.data;
  }
}

function is_red<T>(node: Node<T> | null): boolean {
  return node !== null && node.red;
}

function single_rotate<T>(root: Node<T>, dir: boolean): Node<T> {
  const save = root.get_child(!dir)!;
  root.set_child(!dir, save.get_child(dir));
  save.set_child(dir, root);

  root.red = true;
  save.red = false;

  return save;
}

function double_rotate<T>(root: Node<T>, dir: boolean): Node<T> {
  root.set_child(!dir, single_rotate(root.get_child(!dir)!, !dir));
  return single_rotate(root, dir);
}
