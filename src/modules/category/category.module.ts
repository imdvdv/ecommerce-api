import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { AdminCategoryController } from './admin-category.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
