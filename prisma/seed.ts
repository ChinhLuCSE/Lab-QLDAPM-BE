import { PrismaClient } from '@prisma/client';
import { RoleType } from '../src/user/user.roles';
import Encryptor from '../src/auth/encryptor';
import { randomInt } from 'crypto';
const prisma = new PrismaClient();

//seed roles in Role enumtype
async function main() {
  const promises = [seedRoles(), seedUsers(), seedEvents()];
  await Promise.all(promises);
}

async function seedRoles() {
  const roles = Object.values(RoleType);
  const data = roles.map((role) => ({ name: role }));
  //create role if not exists
  for (const role of data) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}

async function seedUsers() {
  const data = [
    {
      username: RoleType.ADMIN,
      password: await Encryptor.hashPassword(RoleType.ADMIN),
    },
    {
      username: RoleType.ORGANIZER,
      password: await Encryptor.hashPassword(RoleType.ORGANIZER),
    },
    {
      username: RoleType.STUDENT,
      password: await Encryptor.hashPassword(RoleType.STUDENT),
    },
  ];

  const roles = await prisma.role.findMany();

  //create user if not exists
  for (const user of data) {
    if (await prisma.user.findUnique({ where: { username: user.username } }))
      continue; //skip if user already exists

    const createdUser = await prisma.user.create({
      data: {
        username: user.username,
        password: user.password,
        roles: {
          create: {
            roleId: roles.find((r) => r.name == user.username).id, // Replace 1 with the actual roleId value
          },
        },
      },
    });
  }
}

async function seedEvents() {
  const user = await prisma.user.findFirst();
  const dateNow = new Date();
  const data = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      name: `Event ${i}`,
      description: `Event ${i} Description`,
      startDate: dateNow,
      endDate: new Date(dateNow.setDate(dateNow.getDate() + randomInt(1, 10))),
      creatorId: user.id,
    });
  }

  //create event if not exists
  for (const event of data) {
    if (
      await prisma.event.findFirst({
        where: {
          name: event.name,
        },
      })
    )
      continue; //skip if event already exists
    await prisma.event.create({
      data: event,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
