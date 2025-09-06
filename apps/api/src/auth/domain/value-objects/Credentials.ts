export interface Credentials {
  username: string;
  password: string;
}

export class InvalidCredentialsError extends Error {
  constructor(message: string = 'Invalid username or password') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}