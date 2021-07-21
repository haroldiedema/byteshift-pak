import {Buffer} from 'buffer';
import pako     from 'pako';

export class Pak
{
    private readonly storage: { [name: string]: Buffer }              = {};
    private readonly formatters: { [name: string]: PakDataFormatter } = {};

    constructor(private header: string, data?: Buffer, formatters?: {[name: string]: PakDataFormatter})
    {
        if (formatters) {
            this.formatters = formatters;
        }

        if (data) {
            this.import(data);
        }
    }

    /**
     * Adds a data formatter for the given type.
     *
     * The formatter must be an object that consists of an 'encode' and
     * 'decode' function. The 'encode' function accepts arbitrary data and
     * returns a Buffer object or a type that can be serialized into a Buffer,
     * while the 'decode' function accepts a Buffer object and returns the
     * correct data type.
     *
     * @param {string} type
     * @param {PakDataFormatter} formatter
     * @returns {Pak}
     */
    public addFormatter(type: string, formatter: PakDataFormatter): Pak
    {
        this.formatters[type] = formatter;

        return this;
    }

    /**
     * Lists all names of entries inside this pak.
     *
     * @returns {string[]}
     */
    public listEntries(): string[]
    {
        return Object.keys(this.storage);
    }

    /**
     * Write a new entry using the given name.
     *
     * @param {string} name
     * @param {any} data
     * @param {string} type
     */
    public write(name: string, data: any, type?: string)
    {
        if (type && typeof this.formatters[type] !== 'undefined') {
            data = this.formatters[type].encode(data);
        }

        this.storage[name] = (data instanceof Buffer) ? data : Buffer.from(data);
    }

    /**
     * Returns a data buffer associated with the given name.
     *
     * @param {string} name
     * @param {string} type
     * @returns {Buffer}
     */
    public read(name: string, type: string = undefined): Buffer
    {
        if (typeof this.storage[name] === 'undefined') {
            throw new Error(`Entry "${name}" not found.`);
        }

        if (type && typeof this.formatters[type] !== 'undefined') {
            return this.formatters[type].decode(this.storage[name]);
        }

        return this.storage[name];
    }

    /**
     * Exports the contents of this package to a Uint8Array that can be saved
     * to a {.bpk} file.
     *
     * @returns {Buffer}
     */
    public export(): Buffer
    {
        let header: PakHeader = {v: 1, h: this.header, e: {}};
        let offset: number    = 0, key, keys = Object.keys(this.storage), length;
        let data: Buffer[]    = [];

        for (key of keys) {
            length        = this.storage[key].length;
            header.e[key] = [offset, offset + length];
            offset += length;
            data.push(this.storage[key]);
        }

        const headerBuffer = pako.deflateRaw(Buffer.from(JSON.stringify(header)), {level: 8});
        const dataBuffer   = pako.deflateRaw(Buffer.concat(data), {level: 8});

        return Buffer.concat([
            Buffer.from(this.header),
            Buffer.from(headerBuffer.length.toString()),
            Buffer.from(':'),
            headerBuffer,
            dataBuffer,
        ]);
    }

    /**
     * Imports the given data into this Pak instance.
     *
     * @param {} data
     */
    public import(data: Buffer): void
    {
        if (data.slice(0, this.header.length).toString() !== this.header) {
            throw new Error('Invalid file format.');
        }

        let headerLengthBuffer = [],
            headerLength       = null,
            offset             = 0;

        for (offset = this.header.length; offset < 1024; offset++) {
            const byte = data.toString('utf8', offset, offset + 1);

            if (byte.toString() === ':') {
                headerLength = parseInt(headerLengthBuffer.join(''));
                break;
            }

            headerLengthBuffer.push(byte.toString());
        }

        if (!headerLength) {
            throw new Error('Invalid header or empty file.');
        }

        // Extract header and data buffers.
        const head = Buffer.from(pako.inflateRaw(data.slice(offset + 1, offset + headerLength + 1))).toString('utf8');
        const body = Buffer.from(pako.inflateRaw(data.slice(offset + headerLength + 1)));

        let header = null;

        // Try decode header
        try {
            header = JSON.parse(head);
        } catch (_) {
            throw new Error('Invalid header.');
        }

        if (header.h !== this.header) {
            throw new Error('Invalid file format.');
        }

        const keys = Object.keys(header.e || {});
        for (let key of keys) {
            const offset      = header.e[key];
            this.storage[key] = body.slice(offset[0], offset[1]);
        }
    }
}

type PakByteOffset = [number, number];

type PakHeader = {
    v: number,
    h: string,
    e: { [name: string]: PakByteOffset }
}

type PakDataFormatter = {encode: (data: any) => any, decode: (data: Buffer) => any};
