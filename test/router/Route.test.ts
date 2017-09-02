import {expect} from 'chai';
import {Route} from '../../src/router/Route';

describe('Route', () => {

    describe('constructor', () => {

        it('throws when requried props are missing', () => {
            expect(() => {
                new Route({} as any);
            }).to.throw();

            expect(() => {
                new Route({
                    name: 'test',
                    route: '/home'
                } as any);
            }).to.throw();

            expect(() => {
                new Route({
                    name: 'test',
                    component: 'test'
                } as any);
            }).to.throw();
        });

        it('successful with all required props', () => {
            const r = new Route({
                name: 'home',
                route: '/home',
                component: 'test'
            });
            expect(r).to.be.ok;
            expect(r.path).to.equal('/home');
            expect(r.name).to.equal('home');
            expect(r.component).to.equal('test');
        });
    });

    describe('Apply props', () => {

        it('apply url params', () => {
            const r = new Route({
                name: 'home',
                route: '/:foo/:bar',
                component: 'test'
            });
            r.applyParams({
                url: {
                    foo: 'test_foo',
                    bar: 'test_bar'
                }
            });
            expect(r.path).to.equal('/test_foo/test_bar');
            expect(r.params).to.deep.equal({
                url: {
                    foo: 'test_foo',
                    bar: 'test_bar'
                },
                query: {}
            });
        });
    });
});
