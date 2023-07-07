class FedEmbed extends HTMLElement {
    feedUrl;
    timeout;
    user;
    post;
    constructor() {
        super();
        const { source, timeout, user, post } = this.dataset;
        try {
            this.feedUrl = new URL(source);
        }
        catch (_error) { }
        try {
            this.user = new URL(user);
        }
        catch (_error) { }
        try {
            this.post = new URL(post);
        }
        catch (_error) { }
        this.timeout = Number(timeout) || 600;
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
      :where(fed-embed) {
        display: block;
      }

      :where(fed-embed ul) {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }

      :where(fed-embed li) {
        padding: 0.5rem 1.5rem;
        border-bottom: 1px solid #ccc;
      }
    `);
        document.adoptedStyleSheets = [sheet];
    }
    connectedCallback() {
        switch (true) {
            case (!!this.feedUrl):
                this.renderRSSFeed();
                break;
            case (!!this.user):
                this.renderJSONFeed();
                break;
            case (!!this.post):
                this.renderPost();
                break;
            default:
                console.error(`No valid URLs found on ${this.outerHTML}`);
                this.selfDestruct();
                break;
        }
    }
    async renderRSSFeed() {
        const feedString = await this.fetch(this.feedUrl);
        const feed = this.parseXML(feedString);
        const postsList = document.createElement('ul');
        feed.querySelectorAll('item').forEach(item => {
            const text = item.querySelector('description').textContent;
            postsList.insertAdjacentHTML('beforeend', `<li>${text}</li>`);
        });
        this.append(postsList);
    }
    async renderJSONFeed() {
        const { origin, pathname } = this.user;
        let accountLookupURL, statusesURL;
        try {
            accountLookupURL = new URL(`${origin}/api/v1/accounts/lookup?acct=${pathname.replaceAll(/\/@/g, '')}`);
        }
        catch (error) {
            this.selfDestruct(error);
            return;
        }
        const { error, id } = JSON.parse(await this.fetch(accountLookupURL));
        if (error) {
            this.selfDestruct(error);
            return;
        }
        try {
            statusesURL = new URL(`${origin}/api/v1/accounts/${id}/statuses?exclude_replies=true&exclude_reblogs=true`);
        }
        catch (error) {
            this.selfDestruct(error);
            return;
        }
        const posts = JSON.parse(await this.fetch(statusesURL));
        const postsList = document.createElement('ul');
        posts.forEach((post) => {
            postsList.insertAdjacentHTML('beforeend', `<li>${post.content}</li>`);
        });
        this.append(postsList);
    }
    async renderPost() {
        const { origin, pathname } = this.post;
        let postURL;
        try {
            postURL = new URL(`${origin}/api/v1/statuses/${pathname.split('/').at(-1)}`);
        }
        catch (error) {
            this.selfDestruct(error);
            return;
        }
        const { error, content } = JSON.parse(await this.fetch(postURL));
        if (error) {
            this.selfDestruct(error);
            return;
        }
        this.insertAdjacentHTML('beforeend', content);
    }
    selfDestruct(error = null) {
        if (error) {
            console.error(error);
        }
        console.error('A <fed-embed> element has self destructed. Additional logging information may be available above.');
        this.remove();
    }
    async fetch(sourceURL) {
        const { timeout } = this;
        const cachedFeed = localStorage.getItem(sourceURL.toString()) || false;
        if (cachedFeed) {
            const { expires, dataAsString } = JSON.parse(cachedFeed);
            if (expires > Date.now()) {
                return dataAsString;
            }
            localStorage.removeItem(sourceURL.toString());
        }
        const request = await fetch(sourceURL.toString());
        const response = await request.text();
        const cacheItem = {
            expires: Date.now() + (timeout * 1000),
            dataAsString: response,
        };
        localStorage.setItem(sourceURL.toString(), JSON.stringify(cacheItem));
        return response;
    }
    parseXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        return xmlDoc;
    }
}
window.customElements.define('fed-embed', FedEmbed);
