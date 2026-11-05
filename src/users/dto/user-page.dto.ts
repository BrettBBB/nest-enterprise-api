import { ApiProperty } from '@nestjs/swagger';
import { userPageExample } from './user.examples.js';
import { UserResponseDto } from './user-response.dto.js';

/** MUI X `GridGetRowsResponse` for the user grid. */
export class UserGridPageDto {
  @ApiProperty({ type: [UserResponseDto], example: userPageExample.rows })
  rows: UserResponseDto[];

  @ApiProperty({ example: userPageExample.rowCount, minimum: 0 })
  rowCount: number;
}
