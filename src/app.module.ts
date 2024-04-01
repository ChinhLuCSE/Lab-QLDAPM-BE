import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { DatabaseModule } from './prisma.service';

@Module({
  imports: [EventModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
