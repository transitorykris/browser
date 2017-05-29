app:
	cd jngl.iconset && make
	iconutil -c icns ./jngl.iconset

	npm run build

	rm dist/dmg/JnglBrowser.dmg; exit 0
	electron-packager . JnglBrowser \
		--icon ./jngl.icns \
		--out=dist/macos \
		--platform=darwin \
		--arch=x64 \
		--protocol-name="Upspin" \
		--protocol="upspin" \
		--overwrite \
		--ignore dist

	cd jnglctl && go build
	mkdir -p dist/macos/JnglBrowser-darwin-x64/JnglBrowser.app/Contents/Resources/app/jnglctl
	cp jnglctl/jnglctl dist/macos/JnglBrowser-darwin-x64/JnglBrowser.app/Contents/Resources/app/jnglctl/jnglctl

run:
	cd jnglctl && go build
	npm run dev

deps:
	npm install
	cd jnglctl && go get

sign:
	codesign --deep --force --verbose --sign "Developer ID Application: Ahead by a Century, LLC (7UXE8T6JQ7)" dist/macos/JnglBrowser-darwin-x64/JnglBrowser.app
	codesign --verify -vvvv dist/macos/JnglBrowser-darwin-x64/JnglBrowser.app
	spctl -a -vvvv dist/macos/JnglBrowser-darwin-x64/JnglBrowser.app

dmg:
	mkdir -p dist/dmg
	appdmg ./appdmg.json dist/dmg/JnglBrowser.dmg

install:
	rm -rf /Applications/JnglBrowser.app
	mv dist/macos/JnglBrowser-darwin-x64/JnglBrowser.app /Applications

push:
	upspin cp dist/dmg/JnglBrowser.dmg upspin@jn.gl/downloads/JnglBrowser.dmg
	s3cmd put dist/dmg/JnglBrowser.dmg s3://jnglfiles/JnglBrowser.dmg

sha256:
	openssl dgst -sha256 < dist/dmg/jngl.dmg
