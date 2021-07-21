Byteshift PAK
=============

Byteshift PAK is a data container file format for arbitrary data. Exported data
is deflated using the pako (zip) library to minimize file size.

This package uses the following dependencies:

 - [pako](https://github.com/nodeca/pako) : Allow "zlib" features in a browser.
 - [buffer](https://github.com/feross/buffer) : Allow Buffer usage in a browser.

### How to use

```typescript
// Instantiate a new Pak with an arbitrary header. You need the same header in
// order to read exported data. Think of it like a 'secret key'.
const pak = new Pak('my-pak-file');

// Write a simple string or number.
pak.write('foobar', 'This is an arbitrary string');
pak.write('age', 42);

// Export to buffer. You can write this to a file.
const buffer = pak.export();
```

The example above exports a `Buffer` that can be written to a file and imported
again by passing the buffer as a second argument to the `Pak` class constructor.

```typescript
const pak = new Pak('my-pak-file', buffer);

const foobar = pak.read('foobar').toString('utf8');
console.log(foobar); // This is an arbitrary string
```

The header (or secret key) that is given in the first argument MUST match the
one given when a Pak was exported. The buffer fails to decode if the header
string does not match the original one.

For example:
```typescript
const pak = new Pak('secret');
pak.write('foobar', 'hello world');
const buffer = pak.export();

const pak2 = new Pak('another-secret', buffer);
// Error: Invalid file format.
```
