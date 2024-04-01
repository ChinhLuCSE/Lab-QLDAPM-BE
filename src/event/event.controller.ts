import { Controller, Get, Post, Body } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { EventService } from './event.service';
import { CreateEventDTO } from './dto/create.event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getAllEvents(): Promise<Event[]> {
    return this.eventService.events({});
  }

  @Post()
  async createEvent(
    @Body() body: CreateEventDTO,
  ){
    return this.eventService.createEvent(body);
  }
}
