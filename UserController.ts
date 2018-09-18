import {
    Authorized, Body, Get, JsonController, Param, Post, Put, QueryParam
} from 'routing-controllers';

import { User } from '../models/User';
import { UserService } from '../services/UserService';
import { Jwt } from '../../lib/jwt/Jwt';
import { ValidationError } from '../errors/ValidationError';
import { Validator } from 'class-validator';

@Authorized()
@JsonController('/users')
export class UserController {

    constructor(
        private userService: UserService,
        private validator: Validator
    ) {
    }

    @Post('/twitch-connect')
    public twitchConnect(@Body() data: any): Promise<User> {
        const decoded = Jwt.verify(data.twitchJwt, data.extensionId);
        return this.userService.getUserDataFromTwitch(decoded.user_id, data.extensionId);
    }

    @Put('/:id')
    public update(@Param('id') id: string, @Body() user: User): Promise<User> {
        const errors = this.validator.validateSync(user);
        if (errors.length > 0) {
            throw new ValidationError(errors);
        }

        // to disable changing user type by extension users
        delete user.type;

        return this.userService.update(id, user);
    }

    @Get('/channel/:channelId')
    public async channel(@Param('channelId') channelId: string, @QueryParam('extensionId') extensionId: string): Promise<any> {
        return this.userService.getChannelDetails(channelId, extensionId);
    }
}
