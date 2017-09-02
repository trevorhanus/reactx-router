import {expect} from 'chai';
import {isNullOrUndefined} from "../../src/utils/index";

describe('Utils', () => {

    describe('isNullOrUndefined', () => {

        it('accepts array', () => {
            expect(isNullOrUndefined([null, 'test'])).to.be.true;
            expect(isNullOrUndefined(['test'])).to.be.false;
            expect(isNullOrUndefined([undefined, null, true])).to.be.true;
            expect(isNullOrUndefined([true, false])).to.be.false;
        });
    });
});
