/// <reference types="node" />
import { Buffer } from 'buffer';
export declare class Pak {
    private header;
    private readonly storage;
    private readonly formatters;
    constructor(header: string, data?: Buffer, formatters?: {
        [name: string]: PakDataFormatter;
    });
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
    addFormatter(type: string, formatter: PakDataFormatter): Pak;
    /**
     * Lists all names of entries inside this pak.
     *
     * @returns {string[]}
     */
    listEntries(): string[];
    /**
     * Write a new entry using the given name.
     *
     * @param {string} name
     * @param {any} data
     * @param {string} type
     */
    write(name: string, data: any, type?: string): void;
    /**
     * Returns a data buffer associated with the given name.
     *
     * @param {string} name
     * @param {string} type
     * @returns {Buffer}
     */
    read(name: string, type?: string): Buffer;
    /**
     * Exports the contents of this package to a Uint8Array that can be saved
     * to a {.bpk} file.
     *
     * @returns {Buffer}
     */
    export(): Buffer;
    /**
     * Imports the given data into this Pak instance.
     *
     * @param {} data
     */
    import(data: Buffer): void;
}
declare type PakDataFormatter = {
    encode: (data: any) => any;
    decode: (data: Buffer) => any;
};
export {};
