import { AppService } from './app.service';
import { Controller, Get,  All, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
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
    const method = req.method.toLowerCase();
    const url = req.url;
    
    try {
      const response = await this.appService.forwardRequest(
          recipientServiceName,
          method,
          url,
          req.body,
          req.query
      );
      res.status(response.status).json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
