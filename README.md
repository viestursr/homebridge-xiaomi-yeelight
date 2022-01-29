<h1 align="center">💡 homebridge-xiaomi-yeelight 💡</h1>
<p>
  <a href="https://www.npmjs.com/package/homebridge-xiaomi-yeelight" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/homebridge-xiaomi-yeelight.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

Xiaomi branded Yeelight support for Homebridge: https://github.com/nfarina/homebridge.

There are several plugins for Yeelights already, for example https://github.com/cellcortex/homebridge-yeelighter. If you have a Yeelight branded Yeelight that still supports LAN control, my plugin isn't for you.

This plugin focuses on Xiaomi branded Yeelights that were [stripped of the ability to control them via LAN](https://github.com/home-assistant/core/issues/46997#issuecomment-809927764), rendering the above and similar plugins useless for their control.
I got very frustrated by that, considering that these lamps are almost identical to Yeelight lamps. This, combined with the fact that my Xiaomi Yeelight lamps are extremely unreliable in Homekit, motivated me to create my first plugin for Homebridge to alleviate these issues.

I'm happy to report that for me this plugin is incomparably more reliable than their own HomeKit integration. The lights have not gone into a "Not Responding" state since, while previously they went into such state several times per day. 


## Caveats
- Obtaining a device encryption token is required. Althought inconvenient, it's still possible. See "Setting up the lights" section at the bottom.
- Currently I've implemented support only for the `yeelink.light.ceiling22` (the round ceiling LED light) model, since that's the only one available to me. Underlying dependencies (miio) had to be adjusted to support this light as well, since it's not out of the box. You can use `miiocli yeelight --ip 192.168.0.100 --token <secret> info` CLI command to see the model of your device. If it's not `yeelink.light.ceiling22` you can let me know and if it doesn't have any special API requirements I can add that in rather quickly.
 
## Installation

You might want to update npm through: `$ sudo npm -g i npm@latest`

Install this plugin through: `$ sudo npm -g i homebridge-xiaomi-yeelight`

Add this plugin to your HomeBridge platform list, see Configuration section.


## Configuration


```
"platforms": [
  {
    "name": "XiaomiYeelightSupport",
    "debugLogging": false,
    "platform": "XiaomiYeelightSupport"
  }
]
```

The plugin supports setting the configuration through [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x).
You'll be able to configure the device details there, or you can add them as a parameter in the JSON config:

```
"lights": [
    {
        "ipAddress": "192.168.0.100", // local ip address of the light
        "token": "<secret token>", // light encryption token, see Token section for more info
        "name": "Dresser Light" // friendly name for the light
    },
    {
        ...
    }
],
```

## Setting up the lights

Since Xiaomi/Yeelight has removed the option to control Xiaomi branded Yeelights via LAN, this process is more convoluted than it should be.

First of all, you have to obtain the encryption token of the light after adding it to one of the control applications (Xiaomi Home or Yeelight). 
To do so is left as an excercise to the user. Personally I used an Android phone to set up the lights in the Yeelight app, then I downloaded app backup over ADB and extracted the token using Miio CLI from the backup. There are many possible approaches described to extract the token, choose one that fits you best. 

- [Tokens from Mi Home logs](https://python-miio.readthedocs.io/en/latest/discovery.html#tokens-from-mi-home-logs)
- [Tokens from backups](https://python-miio.readthedocs.io/en/latest/discovery.html#tokens-from-backups)
- [Tokens from rooted device](https://python-miio.readthedocs.io/en/latest/discovery.html#tokens-from-rooted-device)
- [A GH Repo that lists several token extraction methods](https://github.com/Maxmudjon/com.xiaomi-miio/blob/master/docs/obtain_token.md)


## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />

## Show your support

Give a ⭐️ if this project helped you!