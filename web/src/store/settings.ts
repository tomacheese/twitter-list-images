export const useSettingsStore = defineStore('settings', {
  state: (): {
    /** 新着のみ表示かどうか */
    isOnlyNew: boolean
    /** ダークテーマかどうか */
    isDarkTheme: boolean | null
    magicGrid: {
      maxCols: number
      maxColWidth: number
      gap: number
    }
  } => ({
    isOnlyNew: false,
    isDarkTheme: null,
    magicGrid: {
      maxCols: 5,
      maxColWidth: 280,
      gap: 10
    }
  }),

  actions: {
    /** 新着のみ表示かどうかを設定する */
    setOnlyNew(isOnlyNew: boolean) {
      this.isOnlyNew = isOnlyNew
    },
    /** ダークテーマかどうかを設定する */
    setDark(isDark: boolean) {
      this.isDarkTheme = isDark
    },
    /** MagicGrid の最大列数を設定する */
    setMagicGridMaxCols(maxCols: number) {
      console.log('setMagicGridMaxCols', maxCols)
      this.magicGrid.maxCols = maxCols
    },
    /** MagicGrid の最大列幅を設定する */
    setMagicGridMaxColWidth(maxColWidth: number) {
      this.magicGrid.maxColWidth = maxColWidth
    },
    /** MagicGrid の間隔を設定する */
    setMagicGridGap(gap: number) {
      this.magicGrid.gap = gap
    }
  },

  persist: {
    storage: persistedState.localStorage
  }
})
