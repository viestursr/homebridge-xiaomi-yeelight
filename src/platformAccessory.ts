import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { XiaomiYeelightPlatform } from './platform';
import miio from 'miio-yeelight22';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Light {
  private service: Service;
  private connection: miio;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private state = {
    On: false,
    Brightness: 100,
    ColorTemperature: 0,
  };

  constructor(
    private readonly platform: XiaomiYeelightPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    miio.device({ address: accessory.context.device.ipAddress, token: accessory.context.device.token })
      .then(device => {
        this.connection = device;
        this.platform.log.info('opened connection to device', device);
      })
      .catch(e => this.platform.log.error(e));

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Xiaomi')
      .setCharacteristic(this.platform.Characteristic.Model, 'Yeelight');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))       // SET - bind to the 'setBrightness` method below
      .onGet(this.getBrightness.bind(this));       // SET - bind to the 'setBrightness` method below

    // // register handlers for the ColorTemperature Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onSet(this.setColorTemperature.bind(this))       // SET - bind to the 'setColorTemperature` method below
      .onGet(this.getColorTemperature.bind(this));       // SET - bind to the 'setColorTemperature` method below

  }

  convertColorTemp(value: number): string {
    return Math.round(1000000 / value).toString();
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    this.state.On = value as boolean;

    this.platform.log.info('setting power to', value);

    try {
      await this.connection.setPower(value);
      this.platform.log.info('power set successfully');
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    try {
      const isOn = await this.connection.power();

      return isOn;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  // /**
  //  * Handle "SET" requests from HomeKit
  //  * These are sent when the user changes the state of an accessory, for example, changing the Brightness
  //  */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.state.Brightness = value as number;

    this.platform.log.info('setting brightness to', value);

    try {
      await this.connection.setBrightness(value);
      this.platform.log.info('brightness set successfully');
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  // /**
  //  * Handle "SET" requests from HomeKit
  //  * These are sent when the user changes the state of an accessory, for example, changing the Brightness
  //  */
  async getBrightness(): Promise<CharacteristicValue> {
    try {
      this.platform.log.info('requesting brightness');
      const brightness = await this.connection.brightness();

      return brightness;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async setColorTemperature(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.state.ColorTemperature = value as number;

    // max brightness for ceiling22
    if (value < 385) {
      value = 385;
    } else if (value > 163) {
      value = 163;
    }

    this.platform.log.info('setting color temp to', value, 'in kelvin:', this.convertColorTemp(value as number));

    try {
      await this.connection.color(`${this.convertColorTemp(400)}k`);
      this.platform.log.info('color temp set successfully');
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  async getColorTemperature(): Promise<CharacteristicValue> {
    try {
      this.platform.log.info('requesting color temperature');
      let colorTemp = await this.connection.color();
      colorTemp = this.convertColorTemp(colorTemp.values[0]);

      this.platform.log.info(colorTemp);

      return colorTemp;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }
}
