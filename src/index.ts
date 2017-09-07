import {router} from './router/Router';
import {Route, IRouteConfig, IViewState} from './router/Route';
import {MobxRouter as Router} from './router/RouterComponent';

import {MessagesStore} from './messages/MessagesStore';
import {Message} from './messages/Message';

import {Dispatcher} from './actions/Dispatcher';
import {Actions, dispatch, dispatcher} from './actions/Actions';
import {AbstractAction as Action} from './actions/AbstractAction';
import {AbstractReversibleAction as ReversibleAction} from './actions/AbstractReversibleAction';

export {
    router,
    Route,
    Router,
    IRouteConfig,
    IViewState,

    MessagesStore,
    Message,

    Actions,
    dispatcher,
    dispatch,
    Dispatcher,
    Action,
    ReversibleAction
}
