# Embed the Fediverse!

All it takes is a single javascript file & one new element in your markup to embed any fediverse feed you want!

## How to use

1. Add the javascript file (< 2kb) to your page.
2. Place the element in your markup.
  - Add a user's rss link to the `data-source` attribute
  - Optionally set `data-timeout` with a number value to prevent re-fetching for that many seconds (default 600s)
3. Share the fediverse on your site!

```html
<html>
  <body>
    <fed-embed data-source="url/to/user.rss"></fed-embed>
    <script src="https://cdn.jsdelivr.net/gh/andy-blum/fed-embed/dist/fed-embed.min.js" timeout="600" type="module"></script>
  </body>
</html>
```

[Demo Codepen!](https://codepen.io/andy-blum/pen/yLQzVor)

_Note that localStorage access is blocked in iFrames so the caching abilities aren't visible in demo._
