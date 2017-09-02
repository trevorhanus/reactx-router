import {observable, ObservableMap, computed, action} from 'mobx';
import {Message} from './Message';

export class MessagesStore {
    @observable private _messages: ObservableMap<Message>;

    constructor() {
        this._messages = observable.map<Message>();
    }

    @computed
    get messages(): Message[] {
        return this._messages.values();
    }

    @action
    add(type: string, message: string): Message {
        const m = new Message(type, message);
        this._messages.set(m.id, m);
        return m;
    }

    @action
    clear(): void {
        this._messages.clear();
    }

    @computed
    get length(): number {
        return this._messages.size;
    }

    @action
    remove(id: string): void {
        this._messages.delete(id);
    }

    @action
    removeByType(type: string): void {
        this._messages.forEach((message: Message) => {
            if (message.type === type) {
                this._messages.delete(message.id);
            }
        });
    }
}