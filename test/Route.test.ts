import { expect } from 'chai';
import { Route } from '../src/Route';
import { TestComponent } from './TestComponent';

describe('Route', () => {

    describe('constructor', () => {

        it('throws when requried props are missing', () => {
            expect(() => {
                new Route({} as any);
            }).to.throw();

            expect(() => {
                new Route({
                    name: 'test',
                    route: '/home',
                } as any);
            }).to.throw();

            expect(() => {
                new Route({
                    name: 'test',
                    component: 'test',
                } as any);
            }).to.throw();
        });

        it('successful with all required props', () => {
            const r = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            expect(r).to.be.ok;
            expect(r.path).to.equal('/home');
            expect(r.name).to.equal('home');
            expect(r.component).to.equal(TestComponent);
        });
    });

    describe('query params', () => {

        it('only accepts the query params in the accepted list', () => {
            const r = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                acceptedQueryParams: ['foo'],
            });
            expect(r.buildUri(null, {bar: 'baz'})).to.equal('/home');
            expect(r.buildUri(null, {foo: 'bar'})).to.equal('/home?foo=bar');
        });
    });

    describe('Path Properties', () => {

        it('no parent route', () => {
            const route = new Route({
                name: 'test',
                path: '/tests/:testId',
                component: TestComponent,
            });
            const uri = route.buildUri({testId: '1234'});
            expect(uri).to.equal('/tests/1234');
            expect(route.path).to.equal('/tests/:testId');
            expect(route.fullPath).to.equal('/tests/:testId');
        });

        it('with parent route', () => {
            const childRoute = new Route({
                name: 'test',
                path: '/tests/:testId',
                component: TestComponent,
            });
            const parentRoute = new Route({
                name: 'index',
                path: '/index',
                component: TestComponent,
                children: [childRoute],
            });
            const uri = childRoute.buildUri({testId: '1234'});
            expect(uri).to.equal('/index/tests/1234');
            expect(childRoute.path).to.equal('/tests/:testId');
            expect(childRoute.fullPath).to.equal('/index/tests/:testId');
        });

        it('with path param in parent route', () => {
            const childRoute = new Route({
                name: 'test',
                path: '/tests/:testId',
                component: TestComponent,
            });
            const parentRoute = new Route({
                name: 'index',
                path: '/merchants/:merchantId',
                component: TestComponent,
                children: [childRoute],
            });
            const uri = childRoute.buildUri({testId: '5678', merchantId: '1234'});
            expect(childRoute.path).to.equal('/tests/:testId');
            expect(childRoute.fullPath).to.equal('/merchants/:merchantId/tests/:testId');
            expect(uri).to.equal('/merchants/1234/tests/5678');
        });
    });
});
