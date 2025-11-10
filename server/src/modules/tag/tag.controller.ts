import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../../utils/jwt-auth.guard';
import { Tag } from '../../entities/tag.entity';
import { LogMethod } from '../../decorators/log.decorator';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagController {
  private readonly logger = new Logger(TagController.name);

  constructor(private readonly tagService: TagService) {
    this.logger.log('TagController initialized');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: Tag,
  })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  @LogMethod('info')
  async create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    this.logger.log(`Creating tag: ${createTagDto.name}`);
    const result = await this.tagService.create(createTagDto);
    this.logger.log(
      `Tag created successfully: ${result.name} (ID: ${result.id})`,
    );
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'List of all tags',
    type: [Tag],
  })
  @LogMethod('debug')
  async findAll(): Promise<Tag[]> {
    this.logger.debug('Fetching all tags');
    const result = await this.tagService.findAll();
    this.logger.debug(`Found ${result.length} tags`);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag found',
    type: Tag,
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @LogMethod('debug')
  async findOne(@Param('id') id: string): Promise<Tag> {
    this.logger.debug(`Fetching tag with ID: ${id}`);
    const result = await this.tagService.findOne(id);
    this.logger.debug(`Tag found: ${result.name} (ID: ${result.id})`);
    return result;
  }
}
