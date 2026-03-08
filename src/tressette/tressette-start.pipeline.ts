import { TressetteMode } from './tressette.mode'
import { TressetteTable, TressetteTableStatus } from './tressette.types'

export type StartPipelineTrigger = 'http' | 'socket'

export type StartPipelineContext = {
    mode: TressetteMode
    table: TressetteTable
    owner: string
    statusBefore: TressetteTableStatus
    trigger: StartPipelineTrigger
}

type StartPipelineDispatcher = (context: StartPipelineContext) => void

let dispatcher: StartPipelineDispatcher | null = null

export const registerStartPipelineDispatcher = (value: StartPipelineDispatcher): void => {
    dispatcher = value
}

export const clearStartPipelineDispatcher = (): void => {
    dispatcher = null
}

export const dispatchStartPipeline = (context: StartPipelineContext): boolean => {
    if (!dispatcher) {
        return false
    }

    dispatcher(context)
    return true
}
