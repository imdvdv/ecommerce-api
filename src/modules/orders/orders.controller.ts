import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { OrdersService } from './orders.service';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from 'src/common/decorators/custom-throttler.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  PaginatedOrderResponseDto,
} from './dto/order-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@JwtAuth()
@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create own order
  @Post()
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Create a new order',
  })
  @ApiBody({
    type: CreateOrderDto,
  })
  @ApiResponse({
    status: 201, 
    description: 'Order created successfully',
    type: OrderApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or insufficient stock' })
  @ApiResponse({ status: 404, description: 'Cart not found or empty' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.ordersService.create(userId, createOrderDto);
  }

  // Get all own orders
  @Get()
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get all orders for current user (paginated)',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    type: PaginatedOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async findAll(@Query() query: QueryOrderDto, @GetUser('id') userId: string) {
    return await this.ordersService.findAll(userId, query);
  }

  // Get own order by ID
  @Get(':id')
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get an order by ID for current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderApiResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.ordersService.findOne(id, userId);
  }

  // Update own order
  @Patch(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Update your own order',
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
    description: 'Order updated successfully'
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.ordersService.update(id, dto, userId);
  }

  // Cancel own order
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ModerateThrottle()
  @ApiOperation({
    summary: 'User cancel order by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiResponse({ 
    status: 204,
    description: 'Order cancelled'
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async cancel(@Param('id') id: string, @GetUser('id') userId: string): Promise<void> {
    await this.ordersService.cancel(id, userId);
  }
}
