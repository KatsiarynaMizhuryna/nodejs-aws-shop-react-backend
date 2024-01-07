import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  async forwardRequest(recipientServiceName: string, method: string, url: string, body: any, query: any) {
    const recipientURL = process.env[recipientServiceName];
    
    if (!recipientURL) {
      throw new Error(`Recipient service ${recipientServiceName} not found`);
    }
    
    try {
      const response = await axios({ method, url: `${recipientURL}${url}`, data: body, params: query });
      return { status: response.status, data: response.data };
    } catch (error) {
      const status = error.response ? error.response.status : 500;
      throw new Error(error.message);
    }
  }
}

