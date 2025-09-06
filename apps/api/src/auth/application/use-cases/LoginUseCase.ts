import { Credentials, InvalidCredentialsError } from '../../domain/value-objects/Credentials';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository';
import { AuthenticationService } from '../../domain/services/AuthenticationService';

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthenticationService
  ) {}

  async execute(credentials: Credentials): Promise<LoginResult> {
    try {
      const user = await this.userRepository.findByUsername(credentials.username);
      
      if (!user) {
        throw new InvalidCredentialsError();
      }

      const isValidPassword = this.authService.validatePassword(
        credentials.password, 
        user.password
      );

      if (!isValidPassword) {
        throw new InvalidCredentialsError();
      }

      const token = this.authService.generateJwtToken({
        userId: user.id,
        username: user.username
      });

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }
}