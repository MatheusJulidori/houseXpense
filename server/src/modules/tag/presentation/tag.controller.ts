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
import { TagService } from '../application/tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../../../utils/jwt-auth.guard';
import { LogMethod } from '../../../decorators/log.decorator';
import { TagResponseDto } from './dto/tag-response.dto';
import { TagPresenter } from './presenters/tag.presenter';

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
    type: TagResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  @LogMethod('info')
  async create(@Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
    this.logger.log(`Creating tag: ${createTagDto.name}`);
    const result = await this.tagService.create(createTagDto);
    this.logger.log(
      `Tag created successfully: ${result.name} (ID: ${result.id})`,
    );
    return TagPresenter.toResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'List of all tags',
    type: TagResponseDto,
    isArray: true,
  })
  @LogMethod('debug')
  async findAll(): Promise<TagResponseDto[]> {
    this.logger.debug('Fetching all tags');
    const result = await this.tagService.findAll();
    this.logger.debug(`Found ${result.length} tags`);
    return TagPresenter.toResponseList(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag found',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @LogMethod('debug')
  async findOne(@Param('id') id: string): Promise<TagResponseDto> {
    this.logger.debug(`Fetching tag with ID: ${id}`);
    const result = await this.tagService.findOne(id);
    this.logger.debug(`Tag found: ${result.name} (ID: ${result.id})`);
    return TagPresenter.toResponse(result);
  }
}
