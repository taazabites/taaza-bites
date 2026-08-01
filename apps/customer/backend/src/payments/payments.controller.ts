import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify')
  async verifyPayment(@Body() body: any, @Res() res: Response) {
    this.logger.log(`Received payment verification request for Order ID: ${body.razorpay_order_id}`);
    
    try {
      const result = await this.paymentsService.verify(body);
      
      if (result.success) {
        this.logger.log(`Payment successfully verified for Order ID: ${body.razorpay_order_id}`);
        return res.status(HttpStatus.OK).json(result);
      } else {
        this.logger.warn(`Payment verification failed: ${result.error}`);
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
    } catch (error: any) {
      this.logger.error(`Error during payment verification: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Backend verification service error',
      });
    }
  }
}
