import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { AdminSessionsController } from './admin-sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [SessionsController, AdminSessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
