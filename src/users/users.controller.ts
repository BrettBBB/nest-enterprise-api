import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiForbiddenResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard.js';
import { parseGridQuery, toGridListArgs } from '../common/grid-query.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserGridPageDto } from './dto/user-page.dto.js';
import { UserIdParamDto } from './dto/user-id-param.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import {
  createUserExample,
  updateUserExample,
  userPageExample,
  userResponseExample,
} from './dto/user.examples.js';
import { userGridFields, userQuickFilterFields } from './user-grid.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({
  description: 'The access token is not an administrator.',
})
@UseGuards(AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      sample: {
        summary: 'Sample user',
        description: 'A valid payload you can submit as-is.',
        value: createUserExample,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
    example: userResponseExample,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation failed.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: createUserDto.password,
      age: createUserDto.age,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'List users',
    description:
      'Reads an optional MUI X GridGetRowsParams object from the grid query parameter. Pagination, sort, and filter can each be omitted.',
  })
  @ApiQuery({
    name: 'grid',
    required: false,
    description:
      'JSON GridGetRowsParams: paginationModel, sortModel, and filterModel are optional.',
    example: {
      paginationModel: { page: 0, pageSize: 10 },
      sortModel: [{ field: 'createdAt', sort: 'desc' }],
      filterModel: { items: [], quickFilterValues: ['ada'] },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Matching users and the total row count, in the grid response shape.',
    type: UserGridPageDto,
    example: userPageExample,
  })
  @ApiResponse({ status: 400, description: 'Invalid filter, sort, or page.' })
  async findAll(@Query('grid') grid?: string) {
    const query = await parseGridQuery(grid);
    return this.usersService.findUsers(
      toGridListArgs(query, {
        fields: userGridFields,
        quickFilterFields: userQuickFilterFields,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the user with the specified ID.',
    type: UserResponseDto,
    example: userResponseExample,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param() params: UserIdParamDto) {
    return this.usersService.findUserById(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      sample: {
        summary: 'Sample update',
        description: 'Send any subset of user fields.',
        value: updateUserExample,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserResponseDto,
    example: {
      ...userResponseExample,
      ...updateUserExample,
      updatedAt: '2026-11-04T16:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation failed.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param() params: UserIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(params.id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email: updateUserDto.email,
      password: updateUserDto.password,
      age: updateUserDto.age,
      isAdmin: updateUserDto.isAdmin,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    type: UserResponseDto,
    example: userResponseExample,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(@Param() params: UserIdParamDto) {
    return this.usersService.deleteUser(params.id);
  }
}
