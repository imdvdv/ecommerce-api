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
import { CategoryService } from './category.service';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('admin/categories')
@AdminOnly()
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Create a new category
  @Post()
  @ApiOperation({ summary: '[ADMIN] Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Category created successfully' 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.create(createCategoryDto);
  }

  // Update category
  @Patch(':id')
  @ApiOperation({ summary: '[ADMIN] Update category' })
  @ApiBody({
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Category slug already exists' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  // Delete category
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Delete category' })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete category with products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoryService.remove(id);
  }
}

