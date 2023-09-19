import { H3Event } from 'h3';
import { AcConfig, ApiResponse } from '~/types';

export default defineEventHandler(async function (event: H3Event): Promise<ApiResponse<AcConfig>> {
  return {
    code: 0,
    data: event.context.config,
  };
});
