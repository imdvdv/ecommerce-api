import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@JwtAuth()
@AdminOnly()
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: '[ADMIN] Create a new product',
  })
  @ApiBody({
    type: CreateProductDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Sku already exists' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '[ADMIN] Update a product',
  })
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Sku already exists' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @ApiOperation({
    summary: '[ADMIN] Update product stock (Admin Only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description:
            'Stock adjustment (positive to add, negative to subtract) ',
          example: 10,
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Not enough goods in stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[ADMIN] Delete product',
  })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete product in active orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.remove(id);
  }
}

