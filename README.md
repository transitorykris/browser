# Jn.gl Browser

This is the Jn.gl Browser. It is a native [Upspin](https://upspin.io) browser built on Electron and React.

This is functional but still has some rough edges and missing features.

Pull requests happily accepted.

![Screenshot](https://s3-us-west-2.amazonaws.com/jn.gl/images/browser.png)

## Download

Pre-compiled disk images for macOS are available at

[https://s3-us-west-2.amazonaws.com/jnglfiles/JnglBrowser.dmg](https://s3-us-west-2.amazonaws.com/jnglfiles/JnglBrowser.dmg)

[upspin://upspin@jn.gl/downloads/JnglBrowser.dmg](upspin://upspin@jn.gl/downloads/JnglBrowser.dmg)

## Development

### Install dependencies

```
make deps
```

### Start dev environment

This will start the app in the dev environment with hot reloading.

```
make run
```

### Build

Build Jngl.app:

```
make app
```

### Install

Install locally in /Applications

```
make install
```

## License

```
Copyright (c) 2017 Jn.gl

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

This software also contains code Copyright (c) 2016 The Upspin Authors. All rights reserved.
