import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Category, Prisma, Product } from '@prisma/client';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      throw new ConflictException(
        `Product with SKU ${createProductDto.sku} already exist`,
      );
    }

    // Try to find category by id, name or slug
    let categoryId = createProductDto.categoryId;
    const foundCategory = await this.prisma.category.findFirst({
      where: {
        OR: [
          { id: { equals: categoryId, mode: 'insensitive' } },
          { slug: { equals: categoryId, mode: 'insensitive' } },
          { name: { equals: categoryId, mode: 'insensitive' } },
        ],
      },
    });

    if (!foundCategory) {
      throw new NotFoundException(`Category by ${categoryId} not found`);
    }
    
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        categoryId: foundCategory.id,
        price: new Prisma.Decimal(createProductDto.price),
      },
      include: {
        category: true,
      },
    });

    return this.formatProduct(product);
  }

  async findAll(queryDto: QueryProductDto): Promise<{
    data: ProductResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { category, isActive, search, page = 1, limit = 10 } = queryDto;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      // Try to find category by name or slug
      const foundCategory = await this.prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: category, mode: 'insensitive' } },
            { slug: { equals: category, mode: 'insensitive' } },
          ],
        },
      });

      if (foundCategory) {
        where.categoryId = foundCategory.id;
      } else {
        // If category not found, return empty result
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });

    return {
      data: products.map((product) => this.formatProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const skuTaken = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (skuTaken) {
        throw new ConflictException(
          `Product with SKU ${updateProductDto.sku} already exists`,
        );
      }
    }

    const updateData: Prisma.ProductUpdateInput = { ...updateProductDto };
    if (updateProductDto.price !== undefined) {
      updateData.price = new Prisma.Decimal(updateProductDto.price);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return this.formatProduct(updatedProduct);
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: {
        category: true,
      },
    });

    return this.formatProduct(updatedProduct);
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        'Cannot delete product that is part of existing orders. Consider marking it as inactive only',
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

  }

  private formatProduct(
    product: Product & { category: Category },
  ): ProductResponseDto {
    return {
      ...product,
      price: Number(product.price),
      category: product.category.name,
    };
  }
}
