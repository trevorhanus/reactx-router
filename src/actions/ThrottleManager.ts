import {IAction} from './AbstractAction';
import {ITimer, Timer} from '@trevorhanus/timer';

export interface IThrottleManager {
    isThrottled: (action: IAction<any, any>) => boolean;
    throttle: (action: IAction<any, any>, duration: number) => void;
}

export class ThrottleManager implements IThrottleManager {
    private _timer: ITimer;

    constructor() {
        this._timer = new Timer();
    }

    isThrottled(action: IAction<any, any>): boolean {
        return this._timer.isPending(action.name);
    }

    throttle(action: IAction<any, any>, duration: number): void {
        if (this.isThrottled(action)) return;
        this._timer.register(action.name, () => {/* noop; just clear the timer */}, duration);
    }
}
