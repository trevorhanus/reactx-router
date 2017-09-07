import * as React from 'react';
import {observer} from 'mobx-react';
import {router} from '../Router';

const MobxRouter = observer(() => {
    return (
        <router.currentRoute.component />
    )
});

export {
    MobxRouter
};
