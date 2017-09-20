import {expect} from 'chai';
import {Route} from '../src/Route';
import {TestComponent} from './TestComponent';

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
                path: '/home',
                component: TestComponent
            });
            expect(r).to.be.ok;
            expect(r.path).to.equal('/home');
            expect(r.name).to.equal('home');
            expect(r.component).to.equal(TestComponent);
        });
    });

    describe('Path Properties', () => {

        it('no parent route', () => {
            const route = new Route({
                name: 'test',
                path: '/tests/:testId',
                component: TestComponent
            });
            route.updateParams({testId: '1234'});
            expect(route.pathDefinition).to.equal('/tests/:testId');
            expect(route.fullPathDefinition).to.equal('/tests/:testId');
            expect(route.path).to.equal('/tests/1234');
            expect(route.fullPath).to.equal('/tests/1234');
            expect(route.pathAndQuery).to.equal('/tests/1234');
        });

        it('with parent route', () => {
            const childRoute = new Route({
                name: 'test',
                path: '/tests/:testId',
                component: TestComponent
            });
            const parentRoute = new Route({
                name: 'index',
                path: '/index',
                component: TestComponent,
                children: [childRoute]
            });
            childRoute.updateParams({testId: '1234'});
            expect(childRoute.pathDefinition).to.equal('/tests/:testId');
            expect(childRoute.fullPathDefinition).to.equal('/index/tests/:testId');
            expect(childRoute.path).to.equal('/tests/1234');
            expect(childRoute.fullPath).to.equal('/index/tests/1234');
            expect(childRoute.pathAndQuery).to.equal('/index/tests/1234');
        });

        it('with path param in parent route', () => {
            const childRoute = new Route({
                name: 'test',
                path: '/tests/:testId',
                component: TestComponent
            });
            const parentRoute = new Route({
                name: 'index',
                path: '/merchants/:merchantId',
                component: TestComponent,
                children: [childRoute]
            });
            childRoute.updateParams({testId: '5678', merchantId: '1234'});
            expect(childRoute.pathDefinition).to.equal('/tests/:testId');
            expect(childRoute.fullPathDefinition).to.equal('/merchants/:merchantId/tests/:testId');
            expect(childRoute.path).to.equal('/tests/5678');
            expect(childRoute.fullPath).to.equal('/merchants/1234/tests/5678');
            expect(childRoute.pathAndQuery).to.equal('/merchants/1234/tests/5678');
        });
    });
});
