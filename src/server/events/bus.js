import { EventEmitter } from 'events'

export const EVENTS = {
  SOLLICITATIE_NIEUW: 'sollicitatie:new',
}

export const bus = new EventEmitter()
bus.setMaxListeners(20)

export default bus
