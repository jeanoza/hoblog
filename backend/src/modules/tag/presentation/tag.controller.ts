import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SearchTagsUseCase } from '../application/search-tags.usecase';
import { DeleteTagUseCase } from '../application/delete-tag.usecase';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(
    private readonly searchTagsUseCase: SearchTagsUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase
  ) {}

  @Get('search')
  search(@Query('q') q = '') {
    return this.searchTagsUseCase.execute(q);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.deleteTagUseCase.execute(id);
  }
}
