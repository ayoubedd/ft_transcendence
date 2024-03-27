import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuthGuard } from './guards/oauth2.guard';
import { AccessTokenResponse } from '@/auth/auth.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RequestWithUser } from '@/utils/request-with-logged-user';
import { TurnOnTwoFaDto } from './dto/turn-two-fa.dto';

interface UserInReq extends Request {
  user?: any;
}

class TwoFaGenerateResponse {
  @ApiProperty()
  url: string;
}

class TwoFaAuthenticateResponse {
  @ApiProperty()
  access_token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiOkResponse({
    type: AccessTokenResponse,
  })
  @ApiUnauthorizedResponse()
  @UseGuards(OAuthGuard)
  login() {}

  @Get('callback')
  @UseGuards(OAuthGuard)
  callback(@Req() req: UserInReq) {
    return this.authService.login(req.user);
  }

  @ApiOkResponse({
    type: TwoFaGenerateResponse,
  })
  @Get('twofa/generate')
  @UseGuards(JwtAuthGuard)
  async generateTwoFaCode(@Req() req: RequestWithUser) {
    const { otpAuthUrl: url } = await this.authService.generateTwoFaAuthSecrete(
      req.user,
    );
    return {
      url,
    };
  }

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @Post('twofa/on')
  @UseGuards(JwtAuthGuard)
  turnOnTwoFa(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) { code }: TurnOnTwoFaDto,
  ) {
    return this.authService.turnOnTwoFa(req.user.userId, code);
  }

  @ApiOkResponse({
    type: TwoFaAuthenticateResponse,
  })
  @Get('twofa/authenticate')
  @UseGuards(JwtAuthGuard)
  twoFaAuthenticate(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) { code }: TurnOnTwoFaDto,
  ) {
    return this.authService.TwoFaAuthenticate(req.user.userId, code);
  }
}
