import type { Socket } from 'socket.io-client'
import type { UnwrapRef, Ref } from 'vue'

type Actions = 'add' | 'remove' | 'update'
type ArrayOfN<T> = [T?, T?, T?]
type EventTypes = ArrayOfN<Actions>
interface Params<T> {
  socket: Socket
  initialValue: T
  event: string
  key?: T extends Array<any> ? keyof T[0] : never // if T is an array we will need to provide a key to find the item
  actions?: T extends Array<any> ? EventTypes : never
  room?: string
}
type FunctionReturnType<T, TItem> = [
  Ref<UnwrapRef<T>>,
  (value: UnwrapRef<T> | TItem, action?: T extends Array<any> ? Actions : never) => void
]

/**
 * This will listen for action:event (ex: add:users) and will update the value accordingly
 *
 * if actions is not provided it will listen for the event directly
 *
 * IMPORTANT:
 * Actions are only supported for arrays
 */
export function useSocket<T, TItem>({
  socket,
  initialValue,
  event,
  actions,
  key,
  room
}: Params<T>): FunctionReturnType<T, TItem> {
  const _value = ref<T>(initialValue)

  function _setter(value: UnwrapRef<T> | TItem, action?: Actions) {
    // if T is an array and action is add or remove
    // we will push or remove the value from the array
    if (_value.value instanceof Array) {
      if (action) actionsHanlders[action](_value.value, value, key)
      else _value.value.push(value)
    }

    // if T is an object and value is an object
    // we will merge the two objects
    // actions are not supported for objects
    else if (_value.value instanceof Object && value instanceof Object) {
      _value.value = { ..._value.value, ...value }
    }

    // otherwise we will just replace the value
    else _value.value = value as UnwrapRef<T>
  }

  const set = (
    value: UnwrapRef<T> | TItem,
    action?: T extends Array<any> ? Actions : never
  ): void => {
    _setter(value, action)
    const _ev = action ? `${action}:${event}` : event
    socket.emit(_ev, value, room)
  }

  _socketEventsListener<T>(socket, event, _setter, actions)

  return [_value, set]
}

const actionsHanlders = {
  add: (array: any[], value: any) => {
    array.push(value)
  },
  remove: (array: any[], value: any, key?: string | number | symbol) => {
    const index = findInArray(array, value, key)
    if (index > -1) array.splice(index, 1)
  },
  update: (array: any[], value: any, key?: string | number | symbol) => {
    const index = findInArray(array, value, key)
    if (index > -1) array[index] = value
  }
}

function _socketEventsListener<T>(
  socket: Socket,
  event: string,
  _setter: (value: any, action?: Actions) => void,
  actions?: EventTypes
) {
  if (actions && actions.length > 0) {
    actions.map((action) => {
      socket.on(`${action}:${event}`, (value: UnwrapRef<T[]>) => {
        _setter(value[0], action)
      })
    })
  } else {
    socket.on(event, (value: UnwrapRef<T[]>) => {
      _setter(value)
    })
  }
}

export function findInArray<T>(array: T[], item: T, key?: string | number | symbol): number {
  if (key) return array.findIndex((i) => i[key as keyof T] === item[key as keyof T])

  return array.findIndex((i) => i === item)
}
