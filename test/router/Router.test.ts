import {Route} from "../../src/router/Route";
import {expect} from 'chai';
import {Router} from '../../src/router/Router';
import {TestComponent} from "./TestComponent";

describe('Router', () => {

    beforeEach(() => {
    });

    afterEach(() => {
    });

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
                component: TestComponent
            });
            window.history.pushState(null, null, '/home');
            router.start([home]);
            expect(router.currentPath).to.equal('/home');
        });
    });

    describe('Router#goTo', () => {

        it('changes route', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent
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
                component: TestComponent
            });
            const home: any = new Route({
                name: 'home',
                path: '/',
                component: TestComponent,
                children: [profile]
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
    });

    describe('LifeCycle Callbacks', () => {
        it('returning false from beforeExit stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                path: '/home',
                component: TestComponent,
                beforeExit: () => false
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent
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
                component: TestComponent
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent,
                beforeEnter: () => false
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
                component: TestComponent
            });
            const user: any = new Route({
                name: 'userProfile',
                path: '/home/:userId',
                component: TestComponent,
                beforeEnter: () => false
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
                }
            });
            const login: any = new Route({
                name: 'login',
                path: '/login',
                component: TestComponent
            });
            window.history.pushState(null, null, '/home');
            router.start([home, login]);
            expect(router.currentPath).to.equal('/login');
            expect(window.location.pathname).to.equal('/login');
        });
    });
});
