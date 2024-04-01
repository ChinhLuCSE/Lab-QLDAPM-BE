import * as bcrypt from 'bcrypt';

export default class Encryptor {
  private static saltOrRounds = 10;

  static async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, Encryptor.saltOrRounds);
    return hash;
  }

  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
