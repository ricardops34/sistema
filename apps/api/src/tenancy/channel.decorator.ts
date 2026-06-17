import { SetMetadata } from '@nestjs/common';

export const ALLOWED_CHANNELS_KEY = 'allowed_channels';

export const AllowedChannels = (...channels: Array<'platform' | 'backoffice' | 'portal'>) =>
  SetMetadata(ALLOWED_CHANNELS_KEY, channels);
