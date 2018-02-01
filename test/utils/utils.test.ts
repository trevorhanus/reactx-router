import {expect} from 'chai';
import {isNullOrUndefined, replacePathParams} from "../../src/utils/utils";
import { IPathParams } from '../../src/interfaces';

describe('Utils', () => {

    describe('isNullOrUndefined', () => {

        it('accepts array', () => {
            expect(isNullOrUndefined([null, 'test'])).to.be.true;
            expect(isNullOrUndefined(['test'])).to.be.false;
            expect(isNullOrUndefined([undefined, null, true])).to.be.true;
            expect(isNullOrUndefined([true, false])).to.be.false;
        });
    });

    describe('replacePathParams', () => {

        it('works', () => {
            const expectations = [
                ['/home', null, '/home'],
                ['/', null, '/'],
                ['/home/:id', {id: '1'}, '/home/1'],
                ['/:profileId/:imageId', {profileId: '12', imageId: '34', other: '56'}, '/12/34']
            ];
            expectations.forEach(expectation => {
                const [path, params, val] = expectation;
                expect(replacePathParams(path as string, params as IPathParams)).to.equal(val);
            });
        });

        it('throws', () => {
            expect(() => {
                replacePathParams('/:home', {id: '1'});
            }).to.throw();
        });
    });
});
