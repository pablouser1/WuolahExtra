import Helpers from './Helpers'


export default class FetchRewriter {
    private hook = [
        {
            'endpoint': '/download',
            'action': this.removeAds
        }
    ]

    private overwrite = [
        {
            'endpoint': '/v2/me',
            'action': this.makePro
        }
    ]

    mod (input: RequestInfo, init: RequestInit | undefined) {
        const path = Helpers.getPath(input.toString())
        const index = this.hook.findIndex(item => path.includes(item.endpoint))
        if (index !== -1) {
            this.hook[index].action(init)
        }
    }

    after (res: Response) {
        const path = Helpers.getPath(res.url)
        const index = this.overwrite.findIndex(item => path.includes(item.endpoint))
        if (index !== -1) {
            this.overwrite[index].action(res)
        }
    }

    // -- Before -- //
    removeAds (init: RequestInit | undefined) {
        Helpers.log('Removing ads')
        if (init) {
            // Overwrite body and force no ads
            init.body = JSON.stringify({
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
            })
        }
    }

    // -- After -- //
    makePro(res: Response) {
        Helpers.log('Making user client-side pro')
        const json = () => res.clone().json().then((data) => ({ ...data, isPro: true }));
        res.json = json;
    }
}
