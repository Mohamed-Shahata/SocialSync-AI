import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { SocialAuthService } from './social-auth.service';
import { Platform } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

const VALID_PLATFORMS = Object.values(Platform);

function parsePlatform(platform: string): Platform {
  const upper = platform.toUpperCase();
  if (!VALID_PLATFORMS.includes(upper as Platform)) {
    throw new BadRequestException(`Unknown platform: ${platform}`);
  }
  return upper as Platform;
}

@Controller('social-auth')
export class SocialAuthController {
  constructor(
    private readonly socialAuthService: SocialAuthService,
    private readonly configService: ConfigService,
  ) {}

  // Called by the client (with its JWT) to get a provider consent URL to
  // navigate the browser to. Kept as a JSON response rather than a redirect
  // so the frontend never has to put the access token in a URL.
  @UseGuards(JwtAuthGuard)
  @Get(':platform/connect')
  connect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('platform') platform: string,
  ) {
    const url = this.socialAuthService.buildConnectUrl(
      user.id,
      parsePlatform(platform),
    );
    return { url };
  }

  // Public: the provider redirects the browser here directly, so there's no
  // Authorization header available. The signed `state` value carries the
  // user identity instead (see SocialAuthService.buildConnectUrl).
  @Get(':platform/callback')
  async callback(
    @Param('platform') platform: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const redirectTo = (status: 'connected' | 'error', detail?: string) => {
      const params = new URLSearchParams({ platform, status });
      if (detail) params.set('message', detail);
      res.redirect(`${frontendUrl}/settings?${params.toString()}#accounts`);
    };

    if (error || !code || !state) {
      return redirectTo('error', error ?? 'missing_code');
    }

    try {
      await this.socialAuthService.handleCallback(
        parsePlatform(platform),
        code,
        state,
      );
      return redirectTo('connected');
    } catch (e) {
      return redirectTo(
        'error',
        e instanceof Error ? e.message : 'connection_failed',
      );
    }
  }
}
