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

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
      .onSet(this.setColorTemperature.bind(this))
      .onGet(this.getColorTemperature.bind(this));

    if (accessory.context.device.hasRgbSupport) {
      this.service.getCharacteristic(this.platform.Characteristic.Hue)
        .onSet(this.setHue.bind(this))
        .onGet(this.getHue.bind(this));

      this.service.getCharacteristic(this.platform.Characteristic.Saturation)
        .onSet(this.setSaturation.bind(this))
        .onGet(this.getSaturation.bind(this));
    }
  }

  isDebugLogging(): boolean {
    return this.platform.config.debugLogging;
  }

  convertColorTemp(value: number): string {
    return Math.round(1000000 / value).toString();
  }

  async setOn(value: CharacteristicValue) {
    this.state.On = value as boolean;

    if (this.isDebugLogging()) {
      this.platform.log.info('setting power to', value);
    }

    try {
      await this.connection.setPower(value);

      if (this.isDebugLogging()) {
        this.platform.log.info('power set successfully');
      }
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  async getOn(): Promise<CharacteristicValue> {
    try {
      const isOn = await this.connection.power();

      return isOn;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async setBrightness(value: CharacteristicValue) {
    this.state.Brightness = value as number;

    if (this.isDebugLogging()) {
      this.platform.log.info('setting brightness to', value);
    }

    try {
      await this.connection.setBrightness(value);

      if (this.isDebugLogging()) {
        this.platform.log.info('brightness set successfully');
      }
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  async getBrightness(): Promise<CharacteristicValue> {
    try {
      const brightness = await this.connection.brightness();

      return brightness;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async setColorTemperature(value: CharacteristicValue) {
    this.state.ColorTemperature = value as number;

    // max brightness for light model ceiling22
    if (value > 384) {
      value = 384;
    } else if (value < 164) {
      value = 164;
    }

    if (this.isDebugLogging()) {
      this.platform.log.info('setting color temp to', value, 'in kelvin:', this.convertColorTemp(value as number));
    }

    try {
      await this.connection.color(`${this.convertColorTemp(value as number)}k`);

      if (this.isDebugLogging()) {
        this.platform.log.info('color temp set successfully');
      }
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  async getColorTemperature(): Promise<CharacteristicValue> {
    try {
      let colorTemp = await this.connection.color();
      colorTemp = this.convertColorTemp(colorTemp.values[0]);

      return colorTemp;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  async setHue(value: CharacteristicValue) {
    if (this.isDebugLogging()) {
      this.platform.log.info('setting hue to', value);
    }

    try {
      await this.connection.color(1);

      if (this.isDebugLogging()) {
        this.platform.log.info('hue set successfully');
      }
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  async getHue(): Promise<CharacteristicValue> {
    try {
      const hue = await this.connection.color();

      this.platform.log.info('hue is', hue);

      return hue;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }


  async setSaturation(value: CharacteristicValue) {
    if (this.isDebugLogging()) {
      this.platform.log.info('setting saturation to', value);
    }

    try {
      await this.connection.color(1);

      if (this.isDebugLogging()) {
        this.platform.log.info('saturation set successfully');
      }
    } catch (e: any) {
      this.platform.log.error(e);
    }
  }

  async getSaturation(): Promise<CharacteristicValue> {
    try {
      const hue = await this.connection.color();

      this.platform.log.info('saturation is', hue);

      return hue;
    } catch (e: any) {
      this.platform.log.error(e);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }
}
