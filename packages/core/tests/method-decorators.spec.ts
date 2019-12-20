import 'jest';
import 'jest-extended';
import 'reflect-metadata';
import {Decorated, f, Field, getClassSchema} from "../src/decorators";

test('Basic array', () => {
    class Other {
    }

    class Controller {
        @Field([Other])
        @Decorated()
        protected readonly bar: Other[] = [];
    }

    const s = getClassSchema(Controller);
    {
        const prop = s.getProperty('bar');
        expect(prop.name).toBe('bar');
        expect(prop.type).toBe('class');
        expect(prop.classType).toBe(Other);
        expect(prop.isArray).toBe(true);
    }
});

test('short @f 2', () => {
    class Controller {
        public foo(@f.array(String) bar: string[]) {
        }

        public foo2(@f.map(String) bar: {[name: string]: string}) {
        }
    }

    const s = getClassSchema(Controller);
    {
        const props = s.getMethodProperties('foo');

        expect(props).toBeArrayOfSize(1);
        expect(props[0].name).toBe('0');
        expect(props[0].type).toBe('string');
        expect(props[0].isArray).toBe(true);
    }
    {
        const props = s.getMethodProperties('foo2');

        expect(props).toBeArrayOfSize(1);
        expect(props[0].name).toBe('0');
        expect(props[0].type).toBe('string');
        expect(props[0].isMap).toBe(true);
    }
});

test('short @f unmet array definition', () => {
    expect(() => {
        class Controller {
            public foo(@f bar: string[]) {
            }
        }
    }).toThrow('Controller::foo::0 type mismatch. Given nothing, but declared is Array')
});

test('short @f no index on arg', () => {
    expect(() => {
        class Controller {
            public foo(@f.index() bar: string[]) {
            }
        }
    }).toThrow('Index could not be used on method arguments')
});

test('method args', () => {
    class Controller {
        public foo(@Field() bar: string) {
        }

        public foo2(@Field() bar: string, optional?: true, @Field().optional() anotherOne?: boolean) {
        }
    }

    const s = getClassSchema(Controller);
    {
        const props = s.getMethodProperties('foo');

        expect(props).toBeArrayOfSize(1);
        expect(props[0].name).toBe('0');
        expect(props[0].type).toBe('string');
    }

    {
        const props = s.getMethodProperties('foo2');

        expect(props).toBeArrayOfSize(3);
        expect(props[0].name).toBe('0');
        expect(props[0].type).toBe('string');

        expect(props[1]).toBeUndefined();

        expect(props[2].name).toBe('2');
        expect(props[2].type).toBe('boolean');
        expect(props[2].isOptional).toBe(true);
    }
});


test('short @f', () => {
    class Controller {
        public foo(@f bar: string) {
        }
    }

    const s = getClassSchema(Controller);
    {
        const props = s.getMethodProperties('foo');

        expect(props).toBeArrayOfSize(1);
        expect(props[0].name).toBe('0');
        expect(props[0].type).toBe('string');
        expect(props[0].isArray).toBe(false);
    }
});


test('short @f with type', () => {
    class Controller {
        public foo(@f.array(String) bar: string[]) {
        }
    }

    const s = getClassSchema(Controller);
    {
        const props = s.getMethodProperties('foo');

        expect(props).toBeArrayOfSize(1);
        expect(props[0].name).toBe('0');
        expect(props[0].type).toBe('string');
        expect(props[0].isArray).toBe(true);
    }
});


test('short @f second type fails', () => {
    expect(() => {
        class Controller {
            public foo(@f.array(String).asMap() bar: string[]) {
            }
        }
    }).toThrow('Field is already defined as array')
});

test('short @f second type fails', () => {
    expect(() => {
        class Controller {
            public foo(@f.map(String).asArray() bar: {}) {
            }
        }
    }).toThrow('Field is already defined as map')
});