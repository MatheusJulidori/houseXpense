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
  Request,
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

interface AuthenticatedRequest {
  user: {
    userId: string;
    username: string;
  };
}

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
  async create(
    @Body() createTagDto: CreateTagDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TagResponseDto> {
    this.logger.log(
      `Creating tag for user ${req.user.userId}: ${createTagDto.name}`,
    );
    const result = await this.tagService.create(createTagDto, req.user.userId);
    this.logger.log(
      `Tag created successfully: ${result.name} (ID: ${result.id}) for user ${req.user.userId}`,
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
  async findAll(
    @Request() req: AuthenticatedRequest,
  ): Promise<TagResponseDto[]> {
    this.logger.debug(`Fetching all tags for user ${req.user.userId}`);
    const result = await this.tagService.findAll(req.user.userId);
    this.logger.debug(
      `Found ${result.length} tags for user ${req.user.userId}`,
    );
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
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<TagResponseDto> {
    this.logger.debug(
      `Fetching tag with ID: ${id} for user ${req.user.userId}`,
    );
    const result = await this.tagService.findOne(id, req.user.userId);
    this.logger.debug(
      `Tag found: ${result.name} (ID: ${result.id}) for user ${req.user.userId}`,
    );
    return TagPresenter.toResponse(result);
  }
}
