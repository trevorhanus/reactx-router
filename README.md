# ReactX-UI

A collection of reactive React Components and MobX stores for building super responsive user interfaces with time-travel and behavior tracking.

## Router

Route:
    name: 'app'
    path: '/'
    component: App
    children:
        -   name: 'home'
            path: '' => matches [domain.com/]
            component: Welcome
        -   name: 'transactions'
            path: '/transactions' => matches [domain.com/transactions]
            component: Transactions
        -   name: 'transaction'
            path: '/transactions/:transactionId' => matches [domain.com/transactions/12341234]
            component: Transaction

Route:
    name: 'login'
    path: '/login'
    component: Login