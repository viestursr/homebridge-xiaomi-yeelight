import { EventEmitter } from 'node:events';
import miio from 'miio';

export interface DeviceInfo {
  ipAddress: string;
  token: string;
  location: string;
  id: string;
  power: boolean;
  brightness: number;
  color: number;
  name: string;
  miioConnection: any;
}

export const EMPTY_DEVICEINFO: DeviceInfo = {
  ipAddress: '',
  token: '',
  location: '',
  id: '',
  power: false,
  brightness: 0,
  color: 0,
  name: 'string',
  miioConnection: {},
};

export interface Command {
  id: number;
  method: string;
  params: Array<number | string | boolean>;
}

export class Device extends EventEmitter {
  info: DeviceInfo;
  connected: boolean;
  forceDisconnect: boolean;

  constructor(info: DeviceInfo) {
    super();
    this.info = info;
    this.connected = false;
    this.forceDisconnect = false;
  }

  connect = async () => {
    try {
      this.forceDisconnect = false;
      const device: any = await new Promise(res => {
        miio.device({ address: this.info.ipAddress, token: this.info.token })
          .then(device => res(device));
      });

      this.info.miioConnection = device;

    } catch (error: any) {
      console.log('failed to connect to device', error);
    }
  };

  updateDevice(device) {
    this.info = device;
  }
}
