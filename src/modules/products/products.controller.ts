import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products with pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },

        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAll(@Query() queryDto: QueryProductDto) {
    return await this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: ' Get product by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productsService.findOne(id);
  }

}
