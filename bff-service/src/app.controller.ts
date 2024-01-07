import { AppService } from './app.service';
import { Controller, Get,  All, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  
  @Get([ '', 'ping' ])
  healthCheck(): any {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }
  
  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    const recipientServiceName = req.params[0];
    const recipientURL = process.env[recipientServiceName];
    
    if (!recipientURL) {
      res.status(400).json({ error: `Recipient service ${recipientServiceName} not found` });
      return;
    }
    
    const method = req.method.toLowerCase();
    const url = `${recipientURL}${req.url}`;
    
    try {
      const response = await axios({ method, url, data: req.body, params: req.query });
      res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response ? error.response.status : 500;
      res.status(status).json({ error: error.message });
    }
  }
}
