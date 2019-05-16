# wparcel

a webpack-based parcel-like web application bundler

## How to use

### start your web app

create an html file

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>example ts app</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- js, jsx, ts & tsx are supported -->
    <script src="src/main.js"></script>
  </body>
</html>
```

script srcs in the html file will be used as webpack entry, files that are referenced by `<link>` or `<img>` will be copied to assets folder

```
yarn add wparcel
yarn wparcel index.html
```

### bundle your web app

```
wparcel build index.html
```
