# MessagesStore

## Constructor

`constructor(): MessagesStore`  
Returns a new, empty instance of MessagesStore

## Properties

`messages: Message[]`  
Returns a list of messages

## Methods

`add(type: string, message: string): Message`  
Adds a message to the store.

`remove(id: string): void`  
Removes a message with the given id.

`removeByType(type: string): void`  
Removes all messages of the given type.
