import { BadRequestException } from '@nestjs/common';
import { parseGridQuery, toGridListArgs } from './grid-query.js';
import { userGridFields, userQuickFilterFields } from '../users/user-grid.js';

const users = {
  fields: userGridFields,
  quickFilterFields: userQuickFilterFields,
};

describe('parseGridQuery', () => {
  it('accepts an empty query when a table uses none of the grid features', async () => {
    const query = await parseGridQuery(undefined);

    expect(query.paginationModel).toBeUndefined();
    expect(query.sortModel).toBeUndefined();
    expect(query.filterModel).toBeUndefined();
    expect(toGridListArgs(query, users)).toEqual({ where: {} });
  });

  it('keeps a single sort column and ignores grid fields this API does not apply', async () => {
    const query = await parseGridQuery(
      JSON.stringify({
        start: 0,
        end: 10,
        paginationModel: { page: 0, pageSize: 10 },
        sortModel: [{ field: 'lastName', sort: 'asc' }],
        filterModel: { items: [] },
      }),
    );

    expect(toGridListArgs(query, users)).toEqual({
      where: {},
      orderBy: [{ lastName: 'asc' }],
      skip: 0,
      take: 10,
    });
  });

  it('rejects a page size above 100', async () => {
    await expect(
      parseGridQuery(JSON.stringify({ paginationModel: { page: 0, pageSize: 500 } })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('toGridListArgs', () => {
  it('applies the same operator map to text, numbers, and dates', async () => {
    const createdAt = new Date('2026-11-04T15:00:00.000Z');
    const query = await parseGridQuery({
      filterModel: {
        logicOperator: 'or',
        quickFilterValues: ['ada', 'lovelace'],
        items: [
          { field: 'firstName', operator: 'contains', value: 'Ada' },
          { field: 'age', operator: '>=', value: 30 },
          { field: 'createdAt', operator: 'onOrAfter', value: createdAt.toISOString() },
          { field: 'email', operator: 'isEmpty' },
          { field: 'lastName', operator: 'startsWith', value: '' },
        ],
      },
    });

    expect(toGridListArgs(query, users).where).toEqual({
      AND: [
        {
          OR: [
            { firstName: { contains: 'Ada', mode: 'insensitive' } },
            { age: { gte: 30 } },
            { createdAt: { gte: createdAt } },
            { OR: [{ email: null }, { email: '' }] },
          ],
        },
        {
          AND: [
            {
              OR: [
                { firstName: { contains: 'ada', mode: 'insensitive' } },
                { lastName: { contains: 'ada', mode: 'insensitive' } },
                { email: { contains: 'ada', mode: 'insensitive' } },
              ],
            },
            {
              OR: [
                { firstName: { contains: 'lovelace', mode: 'insensitive' } },
                { lastName: { contains: 'lovelace', mode: 'insensitive' } },
                { email: { contains: 'lovelace', mode: 'insensitive' } },
              ],
            },
          ],
        },
      ],
    });
  });

  it('rejects a field the table did not list', async () => {
    const query = await parseGridQuery({
      sortModel: [{ field: 'password', sort: 'asc' }],
    });

    expect(() => toGridListArgs(query, users)).toThrow(BadRequestException);
  });
});
