
# pipedrive-embeddable-ringcentral-phone-spa

Add RingCentral Embeddable Voice widgets to pipedrive.

Created with [ringcentral-embeddable-extension-factory](https://github.com/ringcentral/ringcentral-embeddable-extension-factory), you could create similar extension for other CRM sites with it.

## Features

- Add Click-to-call button in page.
- Hover conact list to show Click-to-call tooltip.
- Convert phone number text to Click-to-call link.
- Popup caller info panel when call inbound.
- Build with custom app config.
- Show contact event from RingCentral Widgets.
- Manully/auto Sync Call log/Call recording link/Voicemail/SMS to third party contact event, [About auto call log sync feature](https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone/issues/137).
- Custom X-USER-AGENT header for api request
- Active call control
- Sync call log to deal

## Video

[https://youtu.be/XqDA-VL-OhM](https://youtu.be/XqDA-VL-OhM)

## Screenshots

| screenshots            |  screenshots |
:-------------------------:|:-------------------------:
![ ](screenshots/s4-min.png) | ![ ](screenshots/s1-min.png)
![ ](screenshots/s2-min.png) | ![ ](screenshots/s3-min.png)
![ ](screenshots/s10-min.png) | ![ ](screenshots/s5-min.png)
![ ](screenshots/s6-min.png) | ![ ](screenshots/s7-min.png)
![ ](screenshots/s9-min.png) | ![ ](screenshots/s8-min.png)


## Try it

- Download the zip from release page: [https://github.com/ringcentral/pipedrive-embeddable-ringcentral-phone-spa/releases](https://github.com/ringcentral/pipedrive-embeddable-ringcentral-phone-spa/releases)
- Unpack it, get a dist folder, open your chrome extension page(chrome://extensions/), click load unpacked, select the dist folder
- Go to `pipedrive.com` to check
- Make sure you ***turn off*** `Block third-party cookies` in `chrome://settings/content/cookies`
- Make sure you ***turn off*** `Block third-party cookies` in `chrome://settings/content/cookies`

## Build and Use

1. build `content.js`

```bash

# install dependencies, requires nodejs8.10+
npm i

# download embeddable
npm run down

# create config file, and set proper thirdPartyConfigs.serviceName
cp config.sample.js config.js

# then run it
npm start

# edit src/*.js, webpack will auto-rebuild,
# after rebuild, do not forget to refresh in extension page
```

1. Go to Chrome extensions page.
2. Open developer mode
3. Load `dist` as unpacked package.
4. Go to the CRM site to check

## Build with custom RingCentral clientID/appServer

- Create an app from [https://developer.ringcentral.com/](https://developer.ringcentral.com/), make sure you choose a browser based app, and set all permissions, and add `https://ringcentral.github.io/ringcentral-embeddable/redirect.html` to your redirect URI list, Edit `config.js`.

- Fill your RingCentral app's clientID and appServer in `config.js`.

```js

  ringCentralConfigs: {
    // your ringCentral app's Client ID
    clientID: 'your-clientID',

    // your ringCentral app's Auth Server URL
    appServer: 'your ringCentral app Auth Server URL'
  },
```

## Changelog

Just visit [release page](https://github.com/ringcentral/pipedrive-embeddable-ringcentral-phone-spa/releases)

## Credits

Created with [Embbnux Ji](https://github.com/embbnux)'s tuturial:
 [Building Chrome Extension Integrations with RingCentral Embeddable](https://medium.com/ringcentral-developers/build-a-chrome-extension-with-ringcentral-embeddable-bb6faee808a3)

## License

MIT
