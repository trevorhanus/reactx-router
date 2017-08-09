import {v4 as uuidv4} from 'uuid';

export class Message {
    private _id: string;
    type: string;
    message: string;

    constructor(type: string, message: string) {
        this._id = uuidv4();
        this.type = type;
        this.message = message;
    }

    get id(): string {
        return this._id;
    }
}
