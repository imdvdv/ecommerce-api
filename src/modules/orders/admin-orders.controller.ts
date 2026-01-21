import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { OrdersService } from './orders.service';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from 'src/common/decorators/custom-throttler.decorator';
import {
  OrderApiResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@JwtAuth()
@AdminOnly()
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN] Get all orders (paginated)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(OrderResponseDto) },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async findAllForAdmin(@Query() query: QueryOrderDto) {
    return await this.ordersService.findAllForAdmin(query);
  }

  @Get(':id')
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN] Get order by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async findOneForAdmin(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: '[ADMIN] Update any order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({
    type: UpdateOrderDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Order update successfully',
    type: OrderApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async updateForAdmin(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return await this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ModerateThrottle()
  @ApiOperation({
    summary: '[ADMIN] Cancel order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({ 
    status: 204,
    description: 'Order cancelled'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async cancelForAdmin(@Param('id') id: string): Promise<void> {
    await this.ordersService.cancel(id);
  }
}

