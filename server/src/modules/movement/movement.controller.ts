import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MovementService } from './movement.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { JwtAuthGuard } from '../../utils/jwt-auth.guard';
import { LogMethod } from '../../decorators/log.decorator';
import { MovementResponseDto } from './dto/movement-response.dto';
import { MovementPresenter } from './presenters/movement.presenter';
import { GetMovementsQueryDto } from './dto/get-movements-query.dto';

@ApiTags('movements')
@Controller('movements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovementController {
  private readonly logger = new Logger(MovementController.name);

  constructor(private readonly movementService: MovementService) {
    this.logger.log('MovementController initialized');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a movement' })
  @ApiResponse({
    status: 200,
    description: 'Movement updated',
    type: MovementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movement not found' })
  @LogMethod('info')
  async update(
    @Param('id') id: string,
    @Body() updateMovementDto: UpdateMovementDto,
    @Request() req: { user: { userId: string } },
  ): Promise<MovementResponseDto> {
    this.logger.log(`Updating movement ${id} for user ${req.user.userId}`);
    const result = await this.movementService.update(
      id,
      req.user.userId,
      updateMovementDto,
    );
    this.logger.log(`Movement updated: ${result.id}`);
    return MovementPresenter.toResponse(result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new movement' })
  @ApiResponse({
    status: 201,
    description: 'Movement created successfully',
    type: MovementResponseDto,
  })
  @LogMethod('info')
  async create(
    @Body() createMovementDto: CreateMovementDto,
    @Request() req: { user: { userId: string } },
  ): Promise<MovementResponseDto> {
    this.logger.log(
      `Creating movement for user ${req.user.userId}: ${createMovementDto.description} - ${createMovementDto.amount}`,
    );
    const result = await this.movementService.create(
      createMovementDto,
      req.user.userId,
    );
    this.logger.log(
      `Movement created successfully: ${result.id} - ${result.description}`,
    );
    return MovementPresenter.toResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all movements (optionally filtered by tags)' })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tag names to filter by',
    example: 'investimento,redutível',
  })
  @ApiResponse({
    status: 200,
    description: 'List of movements',
    type: MovementResponseDto,
    isArray: true,
  })
  @LogMethod('debug')
  async findAll(
    @Request() req: { user: { userId: string } },
    @Query() query: GetMovementsQueryDto,
  ): Promise<MovementResponseDto[]> {
    const tagNames = query.tags
      ? query.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;
    this.logger.debug(
      `Fetching movements for user ${req.user.userId}${tagNames ? ` with tags: ${tagNames.join(', ')}` : ''}`,
    );
    const result = await this.movementService.findAll(
      req.user.userId,
      tagNames,
    );
    this.logger.debug(
      `Found ${result.length} movements for user ${req.user.userId}`,
    );
    return MovementPresenter.toResponseList(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a movement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movement found',
    type: MovementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movement not found' })
  @LogMethod('debug')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ): Promise<MovementResponseDto> {
    this.logger.debug(`Fetching movement ${id} for user ${req.user.userId}`);
    const result = await this.movementService.findOne(id, req.user.userId);
    this.logger.debug(`Movement found: ${result.id} - ${result.description}`);
    return MovementPresenter.toResponse(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a movement' })
  @ApiResponse({ status: 204, description: 'Movement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Movement not found' })
  @LogMethod('warn')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ): Promise<void> {
    this.logger.warn(`Deleting movement ${id} for user ${req.user.userId}`);
    await this.movementService.remove(id, req.user.userId);
    this.logger.warn(
      `Movement ${id} deleted successfully for user ${req.user.userId}`,
    );
  }
}
