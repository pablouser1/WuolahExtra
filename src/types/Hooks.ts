interface HookCommon {
    id: string
    endpoint: RegExp
}

export interface HookBefore extends HookCommon {
    func: (input: RequestInfo | URL, init?: RequestInit) => void
}

export interface HookAfter extends HookCommon {
    func: (res: Response) => void
}

export interface HookConfig {
    before?: HookBefore[]
    after?: HookAfter[]
}
