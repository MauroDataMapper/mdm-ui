import {Enums} from '../../src/js/utility/Enums';

test('A simple test', () => {
    expect(Enums.businessTypes[0].key).toBe('restaurant');
});