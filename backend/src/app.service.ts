import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return { app: 'CheckMe API', version: '1.0.0' };
  }
}
