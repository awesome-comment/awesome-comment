import { AcConfig, ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<AcConfig>> {
  return {
    code: 0,
    data: event.context.config,
  };
});
