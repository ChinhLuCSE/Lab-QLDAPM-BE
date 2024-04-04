import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { EventService } from './event.service';
import { CreateEventDTO } from './dto/create.event.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetQueryEventDTO } from './dto/get.event.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('events')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getEvents(
    @Query() query: GetQueryEventDTO,
    @Request() request,
  ): Promise<any[]> {
    return this.eventService.getEvents(request.user.sub, query);
  }

  @Post()
  async createEvent(@Body() body: CreateEventDTO, @Request() req: any) {
    //map the body to Prisma.EventCreateInput
    const data: Prisma.EventCreateInput = {
      name: body.name,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      creator: req.user.sub,
    };
    return this.eventService.createEvent(data);
  }

  @Post('/:id/approve')
  async approveEvent(@Request() req: any, @Param('id') id: string) {
    return await this.eventService.approveEvent(parseInt(id, 10));
  }

  @Post('/:id/deny')
  async denyEvent(@Request() req: any, @Param('id') id: string) {
    return await this.eventService.denyEvent(parseInt(id, 10));
  }

  @Post('/:id/join')
  async joinEvent(@Request() req: any, @Param('id') id: string) {
    return await this.eventService.joinEvent(parseInt(id, 10), req.user.sub);
  }
}
