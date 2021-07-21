import {Buffer} from 'buffer';
import * as fs  from 'fs';
import {Pak}    from '../dist/index';

test('test pak', () => {

    const pak = new Pak('secret');

    pak.write('foobar', 'This is a test');

    expect(pak.listEntries()).toStrictEqual(['foobar']);

    pak.write('test', 'This is number 42');

    const data = pak.export();

    const pak2 = new Pak('secret', data);
    expect(pak2.listEntries()).toStrictEqual(['foobar', 'test']);

    expect(pak2.read('foobar').toString('utf8')).toStrictEqual('This is a test');
    expect(pak2.read('test').toString('utf8')).toStrictEqual('This is number 42');

    fs.writeFileSync('test.bpk', pak2.export());
});

test('data formatters', () => {
    const pak = new Pak('my-header');

    pak.addFormatter('json', {
        encode: (data: any) => JSON.stringify(data),
        decode: (data: Buffer) => JSON.parse(data.toString('utf8')),
    });

    pak.write('some/object', {foo: 42, bar: 'hello world'}, 'json');

    expect(pak.listEntries()).toStrictEqual(['some/object']);
    expect(pak.read('some/object', 'json')).toStrictEqual({foo: 42, bar: 'hello world'});
});
