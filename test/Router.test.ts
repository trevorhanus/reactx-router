import { expect } from 'chai';
import * as sinon from 'sinon';
import { Route } from '../src/Route';
import { Router } from '../src/Router';
import { TestComponent } from './TestComponent';

describe('Router', () => {

    describe('constructor', () => {

        it('works', () => {
            const router = new Router();
            expect(router).to.be.ok;
        });
    });

    describe('start', () => {

        it('throws with no routes', () => {
            const router = new Router();
            expect(() => {
                router.start(null);
            }).to.throw();
        });

        it('throws when two routes have same name', () => {
            const router = new Router();
            const route1: any = {name: 'test'};
            const route2: any = {name: 'test'};
            expect(() => {
                router.start([route1, route2]);
            }).to.throw();
        });

        it('starts at browsers location', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/home');
            router.start([home]);
            expect(router.currentPath).to.equal('/home');
        });

        it('starts with query params', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/home?foo=bar');
            router.start([home]);
            expect(router.currentPath).to.equal('/home?foo=bar');
            expect(router.currentViewState.query).to.deep.equal({foo: 'bar'});
        });

        it('starts properly with encoded query params', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/home?foo=%3Dbar');

            router.start([home]);

            expect(router.currentPath).to.equal('/home?foo=%3Dbar');
            expect(router.currentViewState.query).to.deep.equal({foo: '=bar'});
        });

        it('decodes encoded query params', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/profile?foo=JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');

            router.start([home, user]);
            expect(router.currentPath).to.equal('/profile?foo=JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
            expect(router.currentViewState.query).to.deep.equal({foo: 'JavaScript_шеллы'});
        });

        it('does not decode query params when URI string is malformed', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/profile?stuff=trevor%E0%A4%A');

            router.start([home, user]);

            expect(router.currentViewState.query).to.deep.equal({ stuff: 'trevor%E0%A4%A' });
        });

        it('decodes query params', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/profile?sandwich=peanut%2Bbutter');

            router.start([home, user]);

            expect(router.currentViewState.query.sandwich).to.eq('peanut+butter');
        });

        it('works with hashes', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/profile?sandwich=peanut#foo');
            router.start([home, user]);
            expect(router.currentViewState.query.sandwich).to.eq('peanut');
            expect(router.currentViewState.hash).to.eq('#foo');
        });

        it('works with a double hash', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/profile?#foo#bar');
            router.start([home, user]);
            expect(router.currentViewState.hash).to.eq('#foo#bar');
        });

        it('throws when multiple non-nested routes have the same path', () => {
            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
            });
            const index2: Route = new Route({
                name: 'index2',
                path: '/',
                component: TestComponent,
            });

            const router = new Router();
            expect(() => {
                router.start([index, index2]);
            }).to.throw();
        });

        it('routes to the correct route when a nested route has the same path', () => {
            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                children: [
                    new Route({
                        name: 'nested',
                        path: '/',
                        component: TestComponent,
                    }),
                ],
            });

            const router = new Router();
            window.history.pushState(null, null, '/');
            router.start([index]);
            expect(router.currentRoute.name).to.equal('nested');
        });
    });

    describe('Not Found', () => {

        it('sets currentRoute to 404 when path is not found', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/derp');
            router.start([home]);
            expect(router.currentRoute.name).to.equal('notfound');
        });

        it('can call router.goTo from /notfound', () => {
            const router = new Router();

            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/derp');
            router.start([home]);
            expect(router.currentRoute.name).to.eq('notfound');
            expect(router.currentRoute.path).to.eq('/derp');
            expect(router.currentViewState).to.deep.include({
                params: null,
                query: null,
                hash: null,
            });

            router.goTo('home');
            expect(router.currentRoute.name).to.eq('home');
        });
    });

    describe('Router#goTo', () => {

        it('changes route', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {userId: 'trevor'});
            expect(router.currentPath).to.equal('/home/trevor');
        });

        it('nested routes', () => {
            const router = new Router();
            const profile = new Route({
                name: 'profile',
                path: '/profiles/:userId',
                component: TestComponent,
            });
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
                children: [profile],
            });
            const routes = [home];
            window.history.pushState(null, null, '/');
            router.start(routes);
            expect(router.currentPath).to.equal('/');
            router.goTo('profile', {userId: 'test_id'});
            expect(router.currentPath).to.equal('/profiles/test_id');
            router.goTo('home');
            expect(router.currentPath).to.equal('/');
        });

        it('encodes query param values', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/');
            router.start([home, user]);
            router.goTo('profile', null, {foo: 'JavaScript_шеллы'});
            expect(window.location.search).to.equal('?foo=JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
        });

        it('resets path and query params when returning to a route', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/');
            router.start([home, user]);
            router.goTo('profile', null, {foo: 'JavaScript_шеллы'});
            expect(window.location.search).to.equal('?foo=JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
            // now goTo a different route with no params
            router.goTo('home');
            expect(window.location.search).to.equal('');
            // now return to profile with no params
            router.goTo('profile');
            expect(window.location.search).to.equal('');
        });

        it('works with hashes', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'profile',
                path: '/profile',
                component: TestComponent,
            });

            window.history.pushState(null, null, '/profile?sandwich=peanut#foo');
            router.start([home, user]);
            expect(router.currentViewState.query.sandwich).to.eq('peanut');
            expect(router.currentViewState.hash).to.eq('#foo');
            router.goTo('home', null, null, 'stuff');
            expect(router.currentViewState.query).to.deep.eq({});
            expect(router.currentViewState.hash).to.eq('#stuff');
        });
    });

    describe('LifeCycle Callbacks', () => {

        it('returning false from beforeExit stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                beforeExit: () => false,
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {userId: 'trevor'});
            expect(router.currentPath).to.equal('/home');
        });

        it('returning false from beforeEnter stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent,
                beforeEnter: () => false,
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {userId: 'trevor'});
            expect(router.currentPath).to.equal('/home');
        });

        it('returning false from onEnter stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent,
                beforeEnter: () => false,
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {userId: 'trevor'});
            expect(router.currentPath).to.equal('/home');
        });

        it('transisiton route in callback', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                beforeEnter: () => {
                    router.goTo('login');
                    return false;
                },
            });
            const login: any = new Route({
                name: 'login',
                path: '/login',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/home');
            router.start([home, login]);
            expect(router.currentPath).to.equal('/login');
            expect(window.location.pathname).to.equal('/login');
        });

        it('passes Store to callbacks', () => {
            const store = {loggedIn: false};
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                beforeEnter: (state, store) => {
                    if (!store.loggedIn) {
                        router.goTo('login');
                        return false;
                    }
                },
            });
            const login: any = new Route({
                name: 'login',
                path: '/login',
                component: TestComponent,
            });
            window.history.pushState(null, null, '/home');
            router.start([home, login], store);
            expect(router.currentPath).to.equal('/login');
            store.loggedIn = true;
            router.goTo('home');
            expect(window.location.pathname).to.equal('/home');
        });

        it('calls beforeExit callbacks breadth first for nested routes', () => {
            window.history.pushState(null, null, '/foo');
            const firstStub = sinon.stub();
            const nestedStub = sinon.stub();
            const nestednestedStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: () => {
                    firstStub();
                },
                children: [
                    new Route({
                        name: 'home',
                        path: '/',
                        component: TestComponent,
                        beforeExit: () => {
                            nestedStub();
                        },
                        children: [
                            new Route({
                                name: 'foo',
                                path: '/foo',
                                component: TestComponent,
                                beforeExit: () => {
                                    nestednestedStub();
                                },
                            }),
                        ],
                    }),
                ],
            });
            const other = new Route({
                name: 'other',
                path: '/other',
                component: TestComponent,
            });
            const router = new Router();
            router.start([index, other]);
            router.goTo('other');
            expect(firstStub.calledBefore(nestedStub)).to.be.true;
            expect(nestedStub.calledBefore(nestednestedStub)).to.be.true;
            expect(nestednestedStub.callCount).to.equal(1);
        });

        it('skips nested beforeExit callbacks when parent returns false', () => {
            window.history.pushState(null, null, '/foo');
            const firstStub = sinon.stub();
            const nestednestedStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: () => {
                    firstStub();
                },
                children: [
                    new Route({
                        name: 'home',
                        path: '/',
                        component: TestComponent,
                        beforeExit: () => {
                            return false;
                        },
                        children: [
                            new Route({
                                name: 'foo',
                                path: '/foo',
                                component: TestComponent,
                                beforeExit: () => {
                                    nestednestedStub();
                                },
                            }),
                        ],
                    }),
                ],
            });
            const other = new Route({
                name: 'other',
                path: '/other',
                component: TestComponent,
            });
            const router = new Router();
            router.start([index, other]);
            router.goTo('other');
            expect(firstStub.callCount).to.equal(1);
            expect(nestednestedStub.callCount).to.equal(0);
        });

        it('calls beforeEnter callbacks breadth first for nested routes', () => {
            window.history.pushState(null, null, '/foo');
            const firstStub = sinon.stub();
            const nestedStub = sinon.stub();
            const nestednestedStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeEnter: () => {
                    firstStub();
                },
                children: [
                    new Route({
                        name: 'home',
                        path: '/',
                        component: TestComponent,
                        beforeEnter: () => {
                            nestedStub();
                        },
                        children: [
                            new Route({
                                name: 'foo',
                                path: '/foo',
                                component: TestComponent,
                                beforeEnter: () => {
                                    nestednestedStub();
                                },
                            }),
                        ],
                    }),
                ],
            });
            const other = new Route({
                name: 'other',
                path: '/other',
                component: TestComponent,
            });
            const router = new Router();
            router.start([index, other]);
            expect(firstStub.calledBefore(nestedStub)).to.be.true;
            expect(nestedStub.calledBefore(nestednestedStub)).to.be.true;
            expect(nestednestedStub.callCount).to.equal(1);
        });

        it('calls onEnter callbacks breadth first for nested routes', () => {
            window.history.pushState(null, null, '/foo');
            const firstStub = sinon.stub();
            const nestedStub = sinon.stub();
            const nestednestedStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                onEnter: () => {
                    firstStub();
                },
                children: [
                    new Route({
                        name: 'home',
                        path: '/',
                        component: TestComponent,
                        onEnter: () => {
                            nestedStub();
                        },
                        children: [
                            new Route({
                                name: 'foo',
                                path: '/foo',
                                component: TestComponent,
                                onEnter: () => {
                                    nestednestedStub();
                                },
                            }),
                        ],
                    }),
                ],
            });
            const other = new Route({
                name: 'other',
                path: '/other',
                component: TestComponent,
            });
            const router = new Router();
            router.start([index, other]);
            expect(firstStub.calledBefore(nestedStub)).to.be.true;
            expect(nestedStub.calledBefore(nestednestedStub)).to.be.true;
            expect(nestednestedStub.callCount).to.equal(1);
        });

        it('only calls parent routes lifecycle callbacks', () => {
            window.history.pushState(null, null, '/');
            const firstStub = sinon.stub();
            const nestedStub = sinon.stub();
            const nestednestedStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                onEnter: () => {
                    firstStub();
                },
                children: [
                    new Route({
                        name: 'home',
                        path: '/',
                        component: TestComponent,
                        onEnter: () => {
                            nestedStub();
                        },
                        children: [
                            new Route({
                                name: 'foo',
                                path: '/foo',
                                component: TestComponent,
                                onEnter: () => {
                                    nestednestedStub();
                                },
                            }),
                        ],
                    }),
                ],
            });
            const other = new Route({
                name: 'other',
                path: '/other',
                component: TestComponent,
            });
            const router = new Router();
            router.start([index, other]);
            expect(firstStub.calledBefore(nestedStub)).to.be.true;
            expect(nestedStub.callCount).to.equal(1);
            expect(nestednestedStub.callCount).to.equal(0);
        });

        it('calls beforeExit and onEnter callbacks with the proper params', () => {
            window.history.pushState(null, null, '/');

            const beforeExitStub = sinon.stub();
            const onEnterStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: state => {
                    beforeExitStub(state);
                },
            });

            const home = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                onEnter: state => {
                    onEnterStub();
                },
            });

            const router = new Router();
            router.start([index, home]);

            router.goTo('home');

            expect(beforeExitStub.getCall(0).args[0]).to.deep.equal({
                currentViewState: { route: index, params: {}, query: {}, hash: '' },
                nextViewState: { route: home, params: {}, query: {}, hash: '' },
            });
            expect(beforeExitStub.calledBefore(onEnterStub)).to.be.true;
            expect(beforeExitStub.callCount).to.equal(1);
            expect(onEnterStub.callCount).to.equal(1);
        });

        it('calls beforeExit callback and appends params and query to currentViewState and nextViewState', () => {
            window.history.pushState(null, null, '/');

            const beforeExitStub = sinon.stub();
            const onEnterStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: state => {
                    beforeExitStub(state);
                },
            });

            const home = new Route({
                name: 'home',
                path: '/home/:userId',
                component: TestComponent,
                onEnter: state => {
                    onEnterStub();
                },
            });

            const router = new Router();
            router.start([index, home]);

            router.goTo('home', { userId: 'test' }, { foo: 'bar' });

            expect(beforeExitStub.getCall(0).args[0]).to.deep.equal({
                currentViewState: { route: index, params: {}, query: {}, hash: '' },
                nextViewState: { route: home, params: { userId: 'test' }, query: { foo: 'bar' }, hash: '' },
            });
            expect(window.location.search).to.equal('?foo=bar');
            expect(window.location.pathname).to.equal('/home/test');
            expect(beforeExitStub.calledBefore(onEnterStub)).to.be.true;
            expect(beforeExitStub.callCount).to.equal(1);
            expect(onEnterStub.callCount).to.equal(1);
        });

        it('calls beforeEnter callback with currentViewState and nextViewState', () => {
            window.history.pushState(null, null, '/');
            const beforeExitStub = sinon.stub();
            const beforeEnterStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: state => {
                    beforeExitStub();
                },
            });

            const home = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                beforeEnter: state => {
                    beforeEnterStub(state);
                },
            });

            const router = new Router();
            router.start([index, home]);

            router.goTo('home');

            expect(beforeEnterStub.getCall(0).args[0]).to.deep.equal({
                currentViewState: { route: index, params: {}, query: {}, hash: '' },
                nextViewState: { route: home, params: {}, query: {}, hash: '' },
            });
            expect(beforeExitStub.calledBefore(beforeEnterStub)).to.be.true;
            expect(beforeExitStub.callCount).to.equal(1);
            expect(beforeEnterStub.callCount).to.equal(1);
        });

        it('calls beforeEnter callback and appends params and query to currentViewState and nextViewState', () => {
            window.history.pushState(null, null, '/');
            const beforeExitStub = sinon.stub();
            const beforeEnterStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: state => {
                    beforeExitStub();
                },
            });

            const home = new Route({
                name: 'home',
                path: '/home/:userId',
                component: TestComponent,
                beforeEnter: state => {
                    beforeEnterStub(state);
                },
            });
            const router = new Router();
            router.start([index, home]);
            router.goTo('home', { userId: 'test' }, { foo: 'bar' });

            expect(beforeEnterStub.getCall(0).args[0]).to.deep.equal({
                currentViewState: { route: index, params: {}, query: {}, hash: '' },
                nextViewState: { route: home, params: { userId: 'test' }, query: { foo: 'bar' }, hash: '' },
            });
            expect(window.location.search).to.equal('?foo=bar');
            expect(window.location.pathname).to.equal('/home/test');
            expect(beforeExitStub.calledBefore(beforeEnterStub)).to.be.true;
            expect(beforeExitStub.callCount).to.equal(1);
            expect(beforeEnterStub.callCount).to.equal(1);
        });


        it('calls onEnter callback with currentViewState and previousViewState', () => {
            window.history.pushState(null, null, '/');
            const beforeExitStub = sinon.stub();
            const beforeEnterStub = sinon.stub();
            const onEnterStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: state => {
                    beforeExitStub();
                },
            });

            const home = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                beforeEnter: state => {
                    beforeEnterStub();
                },
                onEnter: state => {
                    onEnterStub(state);
                },
            });
            const router = new Router();
            router.start([index, home]);
            router.goTo('home');
            expect(onEnterStub.getCall(0).args[0]).to.deep.equal({
                currentViewState: { route: home, params: {}, query: {}, hash: '' },
                previousViewState: { route: index, params: {}, query: {}, hash: '' },
            });
            expect(beforeExitStub.calledBefore(beforeEnterStub)).to.be.true;
            expect(beforeEnterStub.calledBefore(onEnterStub)).to.be.true;
            expect(beforeExitStub.callCount).to.equal(1);
            expect(beforeEnterStub.callCount).to.equal(1);
            expect(onEnterStub.callCount).to.equal(1);
        });

        it('calls onEnter callback and appends params and query to currentViewState and nextViewState', () => {
            window.history.pushState(null, null, '/');
            const beforeExitStub = sinon.stub();
            const beforeEnterStub = sinon.stub();
            const onEnterStub = sinon.stub();

            const index: Route = new Route({
                name: 'index',
                path: '/',
                component: TestComponent,
                beforeExit: state => {
                    beforeExitStub();
                },
            });

            const home = new Route({
                name: 'home',
                path: '/home/:userId',
                component: TestComponent,
                beforeEnter: state => {
                    beforeEnterStub();
                },
                onEnter: state => {
                    onEnterStub(state);
                },
            });
            const router = new Router();
            router.start([index, home]);
            router.goTo('home', { userId: 'test' }, { foo: 'bar' });
            expect(onEnterStub.getCall(0).args[0]).to.deep.equal({
                currentViewState: { route: home, params: { userId: 'test' }, query: { foo: 'bar' }, hash: '' },
                previousViewState: { route: index, params: {}, query: {}, hash: '' },
            });
            expect(window.location.search).to.equal('?foo=bar');
            expect(window.location.pathname).to.equal('/home/test');
            expect(beforeExitStub.calledBefore(beforeEnterStub)).to.be.true;
            expect(beforeEnterStub.calledBefore(onEnterStub)).to.be.true;
            expect(beforeExitStub.callCount).to.equal(1);
            expect(beforeEnterStub.callCount).to.equal(1);
            expect(onEnterStub.callCount).to.equal(1);
        });
    });
});
