import {Route} from "../../src/router/Route";
import {expect} from 'chai';
import {Router} from '../../src/router/Router';

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
                route: '/home',
                component: 'test'
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
                route: '/home',
                component: 'test'
            });
            const user: any = new Route({
                name: 'userProfile',
                route: '/home/:userId',
                component: 'test'
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            // expect(router.currentPath).to.equal('/home');
            // router.goTo('userProfile', {url: {userId: 'trevor'}});
            // expect(router.currentPath).to.equal('/home/trevor');
        });

        it('returning false from beforeExit stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                route: '/home',
                component: 'test',
                beforeExit: () => false
            });
            const user: any = new Route({
                name: 'userProfile',
                route: '/home/:userId',
                component: 'test'
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {url: {userId: 'trevor'}});
            expect(router.currentPath).to.equal('/home');
        });

        it('returning false from onExit stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                route: '/home',
                component: 'test',
                onExit: () => false
            });
            const user: any = new Route({
                name: 'userProfile',
                route: '/home/:userId',
                component: 'test'
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {url: {userId: 'trevor'}});
            expect(router.currentPath).to.equal('/home');
        });

        it('returning false from beforeEnter stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                route: '/home',
                component: 'test'
            });
            const user: any = new Route({
                name: 'userProfile',
                route: '/home/:userId',
                component: 'test',
                beforeEnter: () => false
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {url: {userId: 'trevor'}});
            expect(router.currentPath).to.equal('/home');
        });

        it('returning false from onEnter stops route change', () => {
            const router = new Router();
            const home: any = new Route({
                name: 'home',
                route: '/home',
                component: 'test'
            });
            const user: any = new Route({
                name: 'userProfile',
                route: '/home/:userId',
                component: 'test',
                beforeEnter: () => false
            });
            window.history.pushState(null, null, '/home');
            router.start([home, user]);
            expect(router.currentPath).to.equal('/home');
            router.goTo('userProfile', {url: {userId: 'trevor'}});
            expect(router.currentPath).to.equal('/home');
        });
    });
});