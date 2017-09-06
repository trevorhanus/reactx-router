import {action, computed} from 'mobx';
import {ActionError} from './ActionError';
import {DebounceManager, IDebounceManager} from "./DebounceManager";
import {IAction} from './AbstractAction';
import {IReversibleAction} from "./AbstractreversibleAction";
import {isNullOrUndefined} from "util";
import {IThrottleManager, ThrottleManager} from './ThrottleManager';
import {IUndoManager, UndoManager} from './UndoManager';
import {warn} from '../utils';

export interface IDispatcher<Store> {
    dispatch: (action: IAction<Store, any>, options?: DispatchOptions) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export interface DispatchOptions {
    debounce?: number;
    throttle?: number;
}

export class Dispatcher<Store> implements IDispatcher<Store> {
    private _store: Store;
    private _undoManager: IUndoManager<Store>;
    private _throttleManager: IThrottleManager;
    private _debounceManager: IDebounceManager;

    constructor(store: Store, undoManager: IUndoManager<Store>, throttleManager: IThrottleManager, debounceManager: IDebounceManager) {
        this._store = store;
        this._undoManager = undoManager;
        this._throttleManager = throttleManager;
        this._debounceManager = debounceManager;
    }

    public dispatch(action: IAction<Store, any>, options?: DispatchOptions) {
        // return immediately if this action is throttled
        if (this._throttleManager.isThrottled(action)) return;

        const {debounce, throttle} = options || {debounce: null, throttle: null};

        let result: any;
        try {
            result = action.invoke(this._store);

            if (!isNullOrUndefined(throttle)) {
                // register this action with the throttle manager
                // that way if it is dispatched again within the throttle period
                // it will not be invoked
                this._throttleManager.throttle(action, throttle);
            }

            // debouncing
            if (!isNullOrUndefined(debounce) && action.isReversible) {
                this._debounceManager.debounce(action as IReversibleAction<Store, any>, debounce);
            }

            // not debouncing
            if (isNullOrUndefined(debounce) && action.isReversible) {
                this._undoManager.registerAction(action as IReversibleAction<Store, any>);
            }

            return result;

        } catch (e) {
            if (e instanceof ActionError) {
                warn(e.message);
            } else {
                // some unexpected error
                throw e;
            }
        }
    }

    @computed
    public get canUndo(): boolean {
        return this._undoManager.canUndo;
    }

    @computed
    public get canRedo(): boolean {
        return this._undoManager.canRedo;
    }

    @action
    public undo(): void {
        this._undoManager.undo(this._store);
    }

    @action
    public redo(): void {
        this._undoManager.redo(this._store);
    }

    static create<Store>(store: Store): Dispatcher<Store> {
        const undoManager = new UndoManager();
        const throttleManager = new ThrottleManager();
        const debounceManager = new DebounceManager(undoManager);
        return new Dispatcher<Store>(store, undoManager, throttleManager, debounceManager);
    }
}
