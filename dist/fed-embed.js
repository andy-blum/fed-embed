class FedEmbed extends HTMLElement {
    constructor() {
        super();
        const { source, timeout } = this.dataset;
        try {
            this.feedUrl = new URL(source);
        }
        catch (error) {
            console.error(error);
            console.error('A fed-embed element did not have a valid source URL and has self-destructed.');
            this.remove();
            return;
        }
        this.timeout = Number(timeout) || 600;
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
      :where(fed-embed ul) {
        list-style-type: none;
      }

      :where(fed-embed li) {
        padding: 0.5em;
        border-bottom: 1px solid #ccc;
      }
    `);
        document.adoptedStyleSheets = [sheet];
    }
    async connectedCallback() {
        const feed = await this.getFeed();
        const postsList = document.createElement('ul');
        feed.querySelectorAll('item').forEach(item => {
            const text = item.querySelector('description').textContent;
            postsList.insertAdjacentHTML('beforeend', `<li>${text}</li>`);
        });
        this.append(postsList);
    }
    async getFeed() {
        const { feedUrl } = this;
        let cachedFeed = false;
        try {
            cachedFeed = localStorage.getItem(feedUrl.toString()) || false;
        }
        catch (_error) { }
        if (cachedFeed) {
            const { expires, feedString: cachedString } = JSON.parse(cachedFeed);
            if (expires < Date.now()) {
                localStorage.removeItem(feedUrl.toString());
                const feedText = await this.fetchRss();
                return this.parseXML(feedText);
            }
            else {
                return this.parseXML(cachedString);
            }
        }
        const feedText = await this.fetchRss();
        return this.parseXML(feedText);
    }
    async fetchRss() {
        const { feedUrl, timeout } = this;
        const request = await fetch(feedUrl);
        const response = await request.text();
        const cacheItem = {
            expires: Date.now() + (timeout * 1000),
            feedString: response,
        };
        try {
            localStorage.setItem(feedUrl.toString(), JSON.stringify(cacheItem));
        }
        catch (_error) { }
        return response;
    }
    parseXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        return xmlDoc;
    }
}
window.customElements.define('fed-embed', FedEmbed);