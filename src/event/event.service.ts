import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Event, Prisma } from '@prisma/client';
import { GetQueryEventDTO } from './dto/get.event.dto';
import { EventStatus } from './event.status';
import { RoleType } from 'src/user/user.roles';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async event(
    eventWhereUniqueInput: Prisma.EventWhereUniqueInput,
  ): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: eventWhereUniqueInput,
    });
  }

  async events(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.EventWhereUniqueInput;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }): Promise<Event[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.event.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async getEvents(userId: string, query: GetQueryEventDTO): Promise<any[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const rawEvents = await this.prisma.event.findMany({
      include: {
        denied: true,
        approved: true,
        creator: true,
        participants: true,
      },
    });

    const events = rawEvents.map((event) => {
      let nowDate = new Date();
      let status = EventStatus.PENDING;
      //compare the event enddate with the current date
      if (event.endDate < nowDate) {
        status = EventStatus.OUTDATED;
      } else {
        status = event.approved
          ? EventStatus.APPROVED
          : event.denied
            ? EventStatus.DENIED
            : EventStatus.PENDING;
      }
      const result = {
        ...event,
        status,
      };
      result.creator = undefined;
      result.approved = undefined;
      result.denied = undefined;
      return result;
    });

    const userRoles = user.roles.map((role) => role.role.name);
    const eventFilterByRole = events.filter((event) => {
      if (userRoles.includes(RoleType.ADMIN)) {
        return true;
      }
      if (userRoles.includes(RoleType.ORGANIZER)) {
        return event.creatorId === userId;
      }
      return event.approved;
    });

    const finalEvents = eventFilterByRole;

    if (query.statuses) {
      return finalEvents.filter((event) =>
        query.statuses.includes(event.status),
      );
    }

    return finalEvents;
  }

  async createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prisma.event.create({
      data,
    });
  }

  async updateEvent(params: {
    where: Prisma.EventWhereUniqueInput;
    data: Prisma.EventUpdateInput;
  }): Promise<Event> {
    const { where, data } = params;
    return this.prisma.event.update({
      data,
      where,
    });
  }

  async deleteEvent(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    return this.prisma.event.delete({
      where,
    });
  }

  async approveEvent(eventId: number): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        approved: true,
        denied: true,
      },
    });
    if (!event) {
      throw new HttpException('Event not found', 404);
    }

    if (event.approved) {
      throw new HttpException('Event already approved', 400);
    }
    if (event.denied) {
      throw new HttpException('Event already denied', 400);
    }
    if (event.endDate < new Date()) {
      throw new HttpException('Event is outdated', 400);
    }

    await this.prisma.eventApproved.create({
      data: {
        eventId: eventId,
      },
    });

    return true;
  }

  async denyEvent(eventId: number): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        approved: true,
        denied: true,
      },
    });
    if (!event) {
      throw new HttpException('Event not found', 404);
    }

    if (event.approved) {
      throw new HttpException('Event already approved', 400);
    }
    if (event.denied) {
      throw new HttpException('Event already denied', 400);
    }
    if (event.endDate < new Date()) {
      throw new HttpException('Event is outdated', 400);
    }

    await this.prisma.eventDenied.create({
      data: {
        eventId: eventId,
      },
    });

    return true;
  }

  async joinEvent(eventId: number, userId: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        approved: true,
        denied: true,
      },
    });
    if (!event) {
      throw new HttpException('Event not found', 404);
    }

    if (event.denied) {
      throw new HttpException('Event denied', 400);
    }
    if (!event.approved) {
      throw new HttpException('Event not approved', 400);
    }
    if (event.endDate < new Date()) {
      throw new HttpException('Event is outdated', 400);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const eventParticipant = await this.prisma.eventParticipant.findFirst({
      where: {
        eventId: eventId,
        userId: userId,
      },
    });

    if (eventParticipant) {
      throw new HttpException('User already joined the event', 400);
    }
    await this.prisma.eventParticipant.create({
      data: {
        eventId: eventId,
        userId: userId,
      },
    });

    return true;
  }
}
