import { TressetteGameEngineAdapter } from './tressette-game-engine.adapter'
import { TressetteMode } from './tressette.mode'
import { buildDemoTables } from './tressette-demo.seed'
import { TressetteTableStore, tressetteTableStore } from './tressette-table.store'

const demoStore = new TressetteTableStore(new TressetteGameEngineAdapter(), buildDemoTables())
const liveStore = tressetteTableStore

export const getStoreForMode = (mode: TressetteMode): TressetteTableStore => {
    return mode === 'live' ? liveStore : demoStore
}

export const resetStoresForTests = (): void => {
    liveStore.reset()
    demoStore.reset()
}
