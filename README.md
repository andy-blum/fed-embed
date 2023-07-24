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
    <!-- Get a user's latest posts -->
    <fed-embed data-user="https://mastodon.social/@mastodon"></fed-embed>

    <!-- Get a specific post -->
    <fed-embed data-post="https://mastodon.social/@Mastodon/5258563"></fed-embed>

    <!-- Note the version number in the URL -->
    <script src="//cdn.jsdelivr.net/gh/andy-blum/fed-embed@1.0.0/dist/fed-embed.min.js"></script>
  </body>
</html>
```
