import {expect} from 'chai';
import {buildParams} from "../../src/router/buildParams";

describe('buildParams', () => {

   it('blank', () => {
       const params = buildParams('/home', []);
       expect(params).to.deep.equal({url: {}, query: {}});
   });

   it('url params', () => {
       const params = buildParams('/home/:name/:foo', [], ['test_name', 'test_foo']);
       const expected = {
           url: {
               name: 'test_name',
               foo: 'test_foo'
           },
           query: {}
       };
       expect(params).to.deep.equal(expected);
   });

    it('url params with too many values', () => {
        const params = buildParams('/home/:name/:foo', [], ['test_name', 'test_foo', 'one_too_many']);
        const expected = {
            url: {
                name: 'test_name',
                foo: 'test_foo'
            },
            query: {}
        };
        expect(params).to.deep.equal(expected);
    });

    it('sets to undefined when not enough url values', () => {
        const params = buildParams('/home/:name/:foo', [], ['test_name']);
        const expected = {
            url: {
                name: 'test_name',
                foo: undefined
            },
            query: {}
        };
        expect(params).to.deep.equal(expected);
    });

    it('no accepted query params', () => {
        const params = buildParams('/home', [], [], {foo: 'bar'});
        const expected = {
            url: {},
            query: {}
        };
        expect(params).to.deep.equal(expected);
    });

    it('accepted query params', () => {
        const params = buildParams('/home', ['foo'], [], {foo: 'bar'});
        const expected = {
            url: {},
            query: {
                foo: 'bar'
            }
        };
        expect(params).to.deep.equal(expected);
    });

    it('extra accepted query params are not added', () => {
        const params = buildParams('/home', ['foo', 'derp'], [], {foo: 'bar'});
        const expected = {
            url: {},
            query: {
                foo: 'bar'
            }
        };
        expect(params).to.deep.equal(expected);
    });

    it('url and query params', () => {
        const params = buildParams('/home/:foo/bar/:user_id', ['q', 'search'], ['test_foo', 'test_user_id'], {q: 'bar', search: 'derp'});
        const expected = {
            url: {
                foo: 'test_foo',
                user_id: 'test_user_id'
            },
            query: {
                q: 'bar',
                search: 'derp'
            }
        };
        expect(params).to.deep.equal(expected);
    });
});
