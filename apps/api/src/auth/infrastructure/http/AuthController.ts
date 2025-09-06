import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { Credentials } from '../../domain/value-objects/Credentials';

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  async login(body: any) {
    try {
      if (!body.username || !body.password) {
        return {
          status: 400,
          body: {
            success: false,
            message: 'Username and password are required'
          }
        };
      }

      const credentials: Credentials = {
        username: body.username,
        password: body.password
      };

      const result = await this.loginUseCase.execute(credentials);

      if (result.success) {
        return {
          status: 200,
          body: {
            success: true,
            message: 'Login successful',
            user: {
              id: result.user?.id,
              username: result.user?.username
              // Don't return password in response
            }
          }
        };
      } else {
        return {
          status: 401,
          body: {
            success: false,
            message: 'Invalid credentials'
          }
        };
      }
    } catch (error) {
      return {
        status: 500,
        body: {
          success: false,
          message: 'Internal server error'
        }
      };
    }
  }
}