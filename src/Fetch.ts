import Log from './constants/Log'
import Helpers from './Helpers'
import DownloadBody from './types/DownloadBody'


export default class FetchRewriter {
    private beforeActions = [
        {
            'endpoint': /^\/v2\/documents\/[0-9]+\/download$/,
            'action': this.removeAds
        }
    ]

    private afterActions = [
        {
            'endpoint': /^\/user\/me$/,
            'action': this.makePro
        },
        {
            'endpoint': /^\/v2\/me$/,
            'action': this.makeProV2
        }
    ]

    before (input: RequestInfo | URL, init: RequestInit | undefined) {
        const path = Helpers.getPath(input.toString())
        const index = this.beforeActions.findIndex(item => item.endpoint.test(path))
        if (index !== -1) {
            this.beforeActions[index].action(init)
        }
    }

    after (res: Response) {
        const path = Helpers.getPath(res.url)
        const index = this.afterActions.findIndex(item => item.endpoint.test(path))
        if (index !== -1) {
            this.afterActions[index].action(res)
        }
    }

    // -- Before -- //
    removeAds (init: RequestInit | undefined) {
        Helpers.log('Removing ads', Log.INFO)
        if (init && init.body) {
            const old_body: DownloadBody = JSON.parse(init.body.toString())
            Helpers.log('Old Body: ' + JSON.stringify(old_body), Log.DEBUG)
            const new_body = {
                ...old_body,
                ...{
                    "source": "W3",
                    "premium": 0,
                    "blocked": true,
                    "ubication17ExpectedPubs": 0,
                    "ubication1ExpectedPubs": 0,
                    "ubication2ExpectedPubs": 0,
                    "ubication3ExpectedPubs": 0,
                    "ubication17RequestedPubs": 0,
                    "ubication1RequestedPubs": 0,
                    "ubication2RequestedPubs": 0,
                    "ubication3RequestedPubs": 0
                }
            }

            // Overwrite body and force no ads
            init.body = JSON.stringify(new_body)
        }
    }

    // -- After -- //
    makePro(res: Response) {
        Helpers.log('Making user client-side pro', Log.INFO)
        const json = () => res.clone().json().then(data => ({ ...data, pro: 1 }));
        res.json = json;
    }

    makeProV2(res: Response) {
        Helpers.log('Making user client-side pro V2', Log.INFO)
        const json = () => res.clone().json().then(data => ({ ...data, isPro: true }));
        res.json = json;
    }
}
