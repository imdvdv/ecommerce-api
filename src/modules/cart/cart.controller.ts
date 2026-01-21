import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { MergeCartDto } from './dto/merge-cart.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@JwtAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get current user's cart
  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({
    status: 200,
    description: 'User cart with items',
    type: CartResponseDto,
  })
  async getCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return await this.cartService.getOrCreateCart(userId);
  }

  // Add item to cart
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 400,
    description: 'Product unavailable or insufficient stock',
  })
  async addToCart(
    @GetUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.addToCart(userId, addToCartDto);
  }

  // Update cart item quantity
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async updateCartItem(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.updateCartItem(userId, id, updateCartItemDto);
  }

  // Remove item from cart
  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 204,
    description: 'Item removed from cart',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromCart(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.cartService.removeFromCart(userId, id);
  }

  // Clear all items from cart
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({
    status: 204,
    description: 'Cart cleared',
    type: CartResponseDto,
  })
  async clearCart(@GetUser('id') userId: string): Promise<void> {
    await this.cartService.clearCart(userId);
  }

  // Merge guest cart with user cart
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart' })
  @ApiBody({ type: MergeCartDto })
  @ApiResponse({
    status: 200,
    description: 'Merged cart',
    type: CartResponseDto,
  })
  async mergeCart(
    @GetUser('id') userId: string,
    @Body() mergeCartDto: MergeCartDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.mergeCart(userId, mergeCartDto.items);
  }
}
