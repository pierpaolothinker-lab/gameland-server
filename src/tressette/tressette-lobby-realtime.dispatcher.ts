import { TressetteMode } from './tressette.mode'
import { TressetteTable } from './tressette.types'

export type TressetteLobbyRealtimeAction =
    | 'created'
    | 'join'
    | 'leave'
    | 'add_bot'
    | 'starting'
    | 'in_game'

export type TressetteLobbyRealtimeContext = {
    mode: TressetteMode
    action: TressetteLobbyRealtimeAction
    table: TressetteTable
    username?: string
}

type TressetteLobbyRealtimeDispatcher = (context: TressetteLobbyRealtimeContext) => void

let dispatcher: TressetteLobbyRealtimeDispatcher | null = null

export const registerLobbyRealtimeDispatcher = (value: TressetteLobbyRealtimeDispatcher): void => {
    dispatcher = value
}

export const clearLobbyRealtimeDispatcher = (): void => {
    dispatcher = null
}

export const dispatchLobbyRealtime = (context: TressetteLobbyRealtimeContext): boolean => {
    if (!dispatcher) {
        return false
    }

    dispatcher(context)
    return true
}
