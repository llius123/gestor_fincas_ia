import { Credentials, InvalidCredentialsError } from '../../domain/value-objects/Credentials';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository';
import { AuthenticationService } from '../../domain/services/AuthenticationService';

export interface LoginResult {
  success: boolean;
  user?: User;
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

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }
}